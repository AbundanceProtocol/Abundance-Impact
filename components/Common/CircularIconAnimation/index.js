import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BsPerson, BsPersonFill, BsStarFill, BsShieldFillCheck, BsSuitHeartFill, BsCurrencyExchange } from "react-icons/bs";
import { TbArrowBigUp, TbArrowBigUpFilled } from "react-icons/tb";
import { PiArrowBendUpLeftThin, PiArrowBendUpRightThin } from "react-icons/pi";

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

  // Function to get arrow transform based on icon position
  const getArrowTransform = (iconIndex) => {
    const transforms = [
      "translate(0px, -70px) rotate(180deg)",    // Curator (top) - arrow points down
      "translate(80px, -20px) rotate(252deg)",  // Validator (top-right) - arrow points down-left
      "translate(50px, 70px) rotate(324deg)",  // Booster (bottom-right) - arrow points up-left
      "translate(-50px, 70px) rotate(36deg)", // Supporter (bottom-left) - arrow points up-right
      "translate(-80px, -20px) rotate(108deg)" // Caster (left) - arrow points right
    ];
    return transforms[iconIndex] || "";
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
  const settingsMap = ["impactBoost", "validate", "boost", "autoFund", null]; // Maps to isOn properties
  
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
          margin: "0px auto 10px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "0px solid #ace",
          // borderRadius: "50%",
          // backgroundColor: "rgba(0, 34, 68, 0.3)"
        }}
      >
      {/* Abstract Social Media Post in the center */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "108px",
          height: "72px",
          // backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "8px",
          border: (selectedIcon === 1 || selectedIcon === 2 || selectedIcon === 3) ? "1px solid #00ff00" : "1px solid #ddd", // Green border for Validator, Booster, and Supporter
          padding: "12px",
          boxShadow: "0 2px 8px #000000",
          zIndex: 5
        }}
      >
        {/* User avatar circle */}
        <div
          style={{
            width: "14px",
            height: "14px",
            backgroundColor: "#666",
            borderRadius: "50%",
            marginBottom: "8px"
          }}
        />
        
        {/* Text lines */}
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "#333",
            borderRadius: "3px",
            marginBottom: "4px"
          }}
        />
        <div
          style={{
            width: "85%",
            height: "6px",
            backgroundColor: "#333",
            borderRadius: "3px",
            marginBottom: "4px"
          }}
        />
        <div
          style={{
            width: "70%",
            height: "6px",
            backgroundColor: "#333",
            borderRadius: "3px"
          }}
        />
      </div>

      {/* Role-specific bonus indicator */}
      {(selectedIcon === 0 || selectedIcon === 1 || selectedIcon === 2 || selectedIcon === 3) && ( // Curator, Validator, Booster, or Supporter
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) translate(24px, -20px)", // Position at top-right of post
            display: "flex",
            alignItems: "center",
            gap: "4px",
            zIndex: 6
          }}
        >
          {selectedIcon === 0 ? ( // Curator
            <BsStarFill
              size={14}
              style={{
                color: "#0af"
              }}
            />
          ) : ( // Validator or Booster - both use green shield
            <BsShieldFillCheck
              size={14}
              style={{
                color: "#00ff00"
              }}
            />
          )}
          <span
            style={{
              color: selectedIcon === 0 ? "#0af" : "#00ff00",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            +15
          </span>
        </div>
      )}

      {/* Booster heart icon (when Booster or Supporter is selected) */}
      {(selectedIcon === 2 || selectedIcon === 3) && ( // Index 2 is Booster, Index 3 is Supporter
        <BsSuitHeartFill
          size={15}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) translate(38px, 22px)", // Position at bottom-right of post
            color: "#ff0000",
            zIndex: 6
          }}
        />
      )}

      {/* Supporter funding indicators (only when Supporter is selected) */}
      {selectedIcon === 3 && ( // Index 3 is Supporter
        <>
          {/* Caster funding - 70% */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) translate(-85px, -50px)", // Position near Caster icon
              display: "flex",
              alignItems: "center",
              gap: "5px",
              zIndex: 6
            }}
          >
            <BsCurrencyExchange
              size={12}
              style={{
                color: "#ffd700"
              }}
            />
            <span
              style={{
                color: "#ffd700",
                fontSize: "10px",
                fontWeight: "600"
              }}
            >
              70%
            </span>
          </div>

          {/* Curator funding - 10% */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) translate(25px, -75px)", // Position near Curator icon
              display: "flex",
              alignItems: "center",
              gap: "5px",
              zIndex: 6
            }}
          >
            <BsCurrencyExchange
              size={12}
              style={{
                color: "#ffd700"
              }}
            />
            <span
              style={{
                color: "#ffd700",
                fontSize: "10px",
                fontWeight: "600"
              }}
            >
              10%
            </span>
          </div>

          {/* Validator funding - 10% */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) translate(80px, -40px)", // Position near Validator icon
              display: "flex",
              alignItems: "center",
              gap: "5px",
              zIndex: 6
            }}
          >
            <BsCurrencyExchange
              size={12}
              style={{
                color: "#ffd700"
              }}
            />
            <span
              style={{
                color: "#ffd700",
                fontSize: "10px",
                fontWeight: "600"
              }}
            >
              10%
            </span>
          </div>

          {/* Booster funding - 10% */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) translate(90px, 65px)", // Position near Booster icon
              display: "flex",
              alignItems: "center",
              gap: "5px",
              zIndex: 6
            }}
          >
            <BsCurrencyExchange
              size={12}
              style={{
                color: "#ffd700"
              }}
            />
            <span
              style={{
                color: "#ffd700",
                fontSize: "10px",
                fontWeight: "600"
              }}
            >
              10%
            </span>
          </div>
        </>
      )}

      {/* Arrows for each selected icon pointing toward the center post */}
      {selectedIcon !== null && ( // Show arrow for all roles including Supporter
        <TbArrowBigUp
          size={24}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) ${getArrowTransform(selectedIcon)}`,
            color: (() => {
              const settingKey = settingsMap[selectedIcon];
              const isActive = settingKey ? isOn[settingKey] : false;
              return isActive ? "#0af" : "white";
            })(),
            zIndex: 3
          }}
        />
      )}

      {/* Supporter funding arrows (PiArrowBendUpLeftThin at each role position) */}
      {selectedIcon === 3 && ( // Index 3 is Supporter
        <>
          {/* Arrow at Curator position */}
          <PiArrowBendUpLeftThin
            size={28}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-20px, -85px) rotate(60deg)`, // Use Curator's arrow position
              color: "#ffd700",
              zIndex: 3
            }}
          />
          
          {/* Arrow at Validator position */}
          <PiArrowBendUpRightThin
            size={28}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(65px, -35px) rotate(10deg)`, // Use Validator's arrow position
              color: "#ffd700",
              zIndex: 3
            }}
          />
          
          {/* Arrow at Booster position */}
          <PiArrowBendUpRightThin
            size={28}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(45px, 55px) rotate(80deg)`, // Use Booster's arrow position
              color: "#ffd700",
              zIndex: 3
            }}
          />
          
          {/* Arrow at Caster position */}
          <PiArrowBendUpLeftThin
            size={28}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-95px, -45px) rotate(-10deg)`, // Use Caster's arrow position
              color: "#ffd700",
              zIndex: 3
            }}
          />
        </>
      )}

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
                  color: (() => {
                    if (index === 1) return "#00ff00"; // Validator shield - always bright green
                    if (index === 2) return "#ff0000"; // Booster heart - always red
                    if (index === 3) return "#ffd700"; // Supporter currency - always gold
                    return iconColor; // Default color for others
                  })(),
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
      {labels.map((label, index) => {
        const settingKey = settingsMap[index];
        const isActive = settingKey ? isOn[settingKey] : false;
        const labelColor = isActive ? "#0af" : "#ace";
        
        return (
          <div
            key={`label-${index}`}
            className="circle-label"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              color: labelColor,
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
        );
      })}
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
