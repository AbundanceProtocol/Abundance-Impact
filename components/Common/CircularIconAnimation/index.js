import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BsPerson, BsPersonFill, BsStarFill, BsShieldFillCheck, BsSuitHeartFill, BsCurrencyExchange } from "react-icons/bs";

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

// Circular Icon Animation Component
const CircularIconAnimation = ({ isOn = {}, fid = null, show = true }) => {
  const containerRef = useRef(null);
  const [selectedIcon, setSelectedIcon] = React.useState(null);
  
  const handleIconClick = (index) => {
    setSelectedIcon(prev => {
      // If clicking the same icon, deselect it
      if (prev === index) {
        return null;
      }
      // Otherwise, select the new icon (deselecting any previous one)
      return index;
    });
  };
  
  useGSAP(() => {
    if (!show) return;
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
    
    // Static positioning only - no animation
    console.log('Static circular layout created'); // Debug log
  }, { scope: containerRef, dependencies: [isOn, show] });
  
  const labels = ["Curator", "Validator", "Booster", "Supporter", "Caster"];
  const secondaryIcons = [
    BsStarFill,           // Curator
    BsShieldFillCheck,    // Validator  
    BsSuitHeartFill,      // Booster
    BsCurrencyExchange,   // Supporter
    null                  // Caster (no secondary icon specified)
  ];
  
  // Map labels to isOn properties
  const settingsMap = ["boost", "validate", "impactBoost", "autoFund", null]; // Maps to isOn properties
  
  // Text descriptions for each role
  const roleDescriptions = [
    "Curators mominate impactful casts on Farcaster. Earn 10% of tips",
    "Validators ensure the quality of nominations & earn 7% of tips",
    "Boosters auto-like validated casts & earn 7% of tips",
    "Supporters multi-tip impactful casters",
    "Casters can focus on creating valuable content, art, code, etc."
  ];
  
  if (!show) {
    return null;
  }
  
  return (
    <div>
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
        const settingKey = settingsMap[index];
        const isActive = settingKey ? isOn[settingKey] : false;
        const iconColor = isActive ? "#0af" : "#ace";
        const isSelected = selectedIcon === index;
        const PersonIcon = isSelected ? BsPersonFill : BsPerson;
        
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
               <PersonIcon
                 className="circle-icon"
                 size={36}
                 onClick={() => handleIconClick(index)}
                 style={{
                   position: "absolute",
                   left: "50%",
                   top: "50%",
                   transform: "translate(-50%, -50%)",
                   color: isActive ? "#0af" : "white",
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
                  color: iconColor,
                  backgroundColor: "#002244",
                  borderRadius: "50%",
                  padding: "3px",
                  border: "1px solid #ace",
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
      
      {/* Text box that changes based on selected icon */}
      <div
        style={{
          marginTop: "30px",
          padding: "10px 25px",
          backgroundColor: "rgba(0, 34, 68, 0.8)",
          border: "1px solid #ace",
          borderRadius: "8px",
          maxWidth: "400px",
          margin: "10px 25px 50px 25px",
          textAlign: "center",
          height: "110px"
        }}
      >
        <h3
          style={{
            color: "#ace",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "10px",
            marginTop: "0"
          }}
        >
          {selectedIcon !== null ? labels[selectedIcon] : "Select a Role"}
        </h3>
        <p
          style={{
            color: "white",
            fontSize: "14px",
            lineHeight: "1.5",
            margin: "0"
          }}
        >
          {selectedIcon !== null 
            ? roleDescriptions[selectedIcon] 
            : "Click on any icon above to learn more about that role."
          }
        </p>
      </div>
    </div>
  );
};

export default CircularIconAnimation;
