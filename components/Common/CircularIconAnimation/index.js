import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BsPerson, BsStarFill, BsShieldFillCheck, BsSuitHeartFill, BsCurrencyExchange } from "react-icons/bs";

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

// Circular Icon Animation Component
const CircularIconAnimation = () => {
  const containerRef = useRef(null);
  
  useGSAP(() => {
    const iconWrappers = containerRef.current.querySelectorAll('.icon-wrapper');
    const labels = containerRef.current.querySelectorAll('.circle-label');
    const secondaryIcons = containerRef.current.querySelectorAll('.secondary-icon');
    if (iconWrappers.length === 0) return;
    
    const radius = 133; // Icon radius for 320px container (121px + 10% = 133px) 
    
    console.log('GSAP Animation starting with', iconWrappers.length, 'icon wrappers'); // Debug log
    
    // Position icons and labels in a circle
    iconWrappers.forEach((wrapper, index) => {
      const angle = (index * 2 * Math.PI) / 5;
      const iconX = radius * Math.cos(angle - Math.PI / 2);
      const iconY = radius * Math.sin(angle - Math.PI / 2);
      
      gsap.set(wrapper, {
        x: iconX,
        y: iconY,
        transformOrigin: "center center"
      });
      
      // Position secondary icon relative to the wrapper
      if (secondaryIcons[index]) {
        gsap.set(secondaryIcons[index], {
          x: iconX + 3, // 3px to the right of icon center (5px - 2px northwest)
          y: iconY + 3, // 3px below icon center (5px - 2px northwest)
          transformOrigin: "center center"
        });
      }
      
      // Position corresponding label directly under the icon
      if (labels[index]) {
        // Calculate label position: same X as icon, Y position + 30px below icon
        const labelX = iconX;
        const labelY = iconY + 30; // 30px below the icon
        
        gsap.set(labels[index], {
          x: labelX,
          y: labelY,
          transformOrigin: "center center",
          xPercent: -50, // Center horizontally
          yPercent: -50  // Center vertically
        });
      }
    });
    
    // Create the animation timeline
    const tl = gsap.timeline({ repeat: -1 });
    
    // Animate each icon sequentially - color only
    const icons = containerRef.current.querySelectorAll('.circle-icon');
    icons.forEach((icon, index) => {
      tl.to(icon, {
        duration: 0.5,
        ease: "power2.inOut",
        onStart: () => {
          icon.style.color = "#ace";
        }
      }, index * 0.4)
      .to(icon, {
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          icon.style.color = "white";
        }
      }, index * 0.4 + 0.5);
    });
    
    console.log('GSAP Timeline created:', tl); // Debug log
    
    return tl;
  }, { scope: containerRef, dependencies: [] });
  
  const labels = ["Curator", "Validator", "Booster", "Supporter", "Caster"];
  const secondaryIcons = [
    BsStarFill,           // Curator
    BsShieldFillCheck,    // Validator  
    BsSuitHeartFill,      // Booster
    BsCurrencyExchange,   // Supporter
    null                  // Caster (no secondary icon specified)
  ];
  
  return (
    <div 
      ref={containerRef}
      style={{
        position: "relative",
        width: "320px",
        height: "320px",
        margin: "20px auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "0px solid #ace",
        // borderRadius: "50%",
        // backgroundColor: "rgba(0, 34, 68, 0.3)"
      }}
    >
      {[...Array(5)].map((_, index) => {
        const SecondaryIcon = secondaryIcons[index];
        return (
          <React.Fragment key={`icon-group-${index}`}>
            <div
              className="icon-wrapper"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                // backgroundColor: "rgba(0, 255, 0, 0.2)", // Debug background
                // border: "1px solid green", // Debug border
                width: "40px",
                height: "40px"
              }}
            >
               <BsPerson
                 className="circle-icon"
                 size={36}
                 style={{
                   position: "absolute",
                   left: "50%",
                   top: "50%",
                   transform: "translate(-50%, -50%)",
                   color: "white",
                   cursor: "pointer"
                 }}
               />
            </div>
            {SecondaryIcon && (
              <SecondaryIcon
                className="secondary-icon"
                size={22}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#ace",
                  // backgroundColor: "#002244",
                  borderRadius: "50%",
                  padding: "3px",
                  border: "0px solid #ace",
                  zIndex: 10
                }}
              />
            )}
          </React.Fragment>
        );
      })}
      {labels.map((label, index) => (
        <div
          key={`label-${index}`}
          className="circle-label"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            color: "#ace",
            fontSize: "14px",
            fontWeight: "600",
            textAlign: "center",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            width: "max-content",
            // backgroundColor: "rgba(255, 0, 0, 0.2)", // Debug background
            // border: "1px solid red" // Debug border
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default CircularIconAnimation;
