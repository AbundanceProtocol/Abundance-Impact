"use client";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

export default function Paradigm() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedButton, setSelectedButton] = useState(null);

  // Debug: Check if refs are available
  useEffect(() => {
    console.log("Left ref:", leftRef.current);
    console.log("Right ref:", rightRef.current);
    console.log("Container ref:", containerRef.current);
    
    // Force visibility for debugging
    if (leftRef.current) {
      leftRef.current.style.opacity = "1";
      leftRef.current.style.display = "flex";
    }
    if (rightRef.current) {
      rightRef.current.style.opacity = "1";
      rightRef.current.style.display = "flex";
    }
  }, []);

  const handleButtonClick = (buttonName) => {
    console.log('Button clicked:', buttonName, 'Current selected:', selectedButton);
    // If clicking the same button that's already selected, deselect it
    if (selectedButton === buttonName) {
      setSelectedButton(null);
      console.log('Deselected button');
    } else {
      // Otherwise, select the new button
      setSelectedButton(buttonName);
      console.log('Selected button:', buttonName);
    }
  };

  useGSAP(() => {
    if (leftRef.current && rightRef.current) {
      console.log("Starting GSAP animations");
      
      // Slide in from sides animation
      gsap.fromTo(leftRef.current, 
        { x: -400, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.5, ease: "power3.out" }
      );
      
      gsap.fromTo(rightRef.current, 
        { x: 400, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.3 }
      );
    } else {
      console.log("Refs not available for animation");
    }
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Buttons */}
      <div style={{
        position: 'absolute',
        top: 'calc(50vh - 200px - 2rem - 100px)',
        left: '0',
        right: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        {/* First row */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button 
            onClick={() => handleButtonClick('medicine')}
            style={{
              backgroundColor: selectedButton === 'medicine' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            medicine
          </button>
          <button 
            onClick={() => handleButtonClick('social media')}
            style={{
              backgroundColor: selectedButton === 'social media' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            social media
          </button>
        </div>
        
        {/* Second row */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button 
            onClick={() => handleButtonClick('innovation')}
            style={{
              backgroundColor: selectedButton === 'innovation' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            innovation
          </button>
          <button 
            onClick={() => handleButtonClick('purpose')}
            style={{
              backgroundColor: selectedButton === 'purpose' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            purpose
          </button>
          <button 
            onClick={() => handleButtonClick('digital tech')}
            style={{
              backgroundColor: selectedButton === 'digital tech' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            digital tech
          </button>
        </div>

        {/* Third row */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button 
            onClick={() => handleButtonClick('AI')}
            style={{
              backgroundColor: selectedButton === 'AI' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            AI
          </button>
          <button 
            onClick={() => handleButtonClick('journalism')}
            style={{
              backgroundColor: selectedButton === 'journalism' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            journalism
          </button>
          <button 
            onClick={() => handleButtonClick('science')}
            style={{
              backgroundColor: selectedButton === 'science' ? '#16a34a' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            science
          </button>
        </div>
      </div>

      {/* Connecting Lines - Only show when a button is selected */}

      {/* Left ellipse - Green */}
      <div
        ref={leftRef}
        style={{
          position: 'absolute',
          width: '600px',
          height: '400px',
          backgroundColor: 'rgba(22, 163, 74, 0.9)',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px',
          left: 'calc(50% - 100px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2', textAlign: 'center' }}>
          abundance<br />
          economy
        </h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '18px', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '8px' }}>alignment</li>
          <li style={{ marginBottom: '8px' }}>value creation</li>
          <li style={{ marginBottom: '8px' }}>common good</li>
          <li style={{ marginBottom: '8px' }}>abundance</li>
          <li style={{ marginBottom: '8px' }}>collaboration</li>
          <li style={{ marginBottom: '8px' }}>efficiency</li>
        </ul>
        
      </div>

      {/* Right ellipse - Grey */}
      <div
        ref={rightRef}
        style={{
          position: 'absolute',
          width: '600px',
          height: '400px',
          backgroundColor: 'rgba(107, 114, 128, 0.9)',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px',
          right: 'calc(50% - 100px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2', textAlign: 'center' }}>
          current<br />
          economy
        </h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '18px', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '8px' }}>misalignment</li>
          <li style={{ marginBottom: '8px' }}>extraction</li>
          <li style={{ marginBottom: '8px' }}>externalities</li>
          <li style={{ marginBottom: '8px' }}>scarcity</li>
          <li style={{ marginBottom: '8px' }}>adversariality</li>
          <li style={{ marginBottom: '8px' }}>inefficiency</li>
        </ul>
        
      </div>

      {/* Independent rectangles positioned outside ellipses */}
      {selectedButton && (
        <>
          {console.log('Rendering rectangles for selectedButton:', selectedButton)}
          {/* Green rectangle - positioned over left ellipse */}
          <div 
            ref={(el) => {
              if (el && selectedButton) {
                // All rectangles use the same animation as journalism grey rectangle
                gsap.fromTo(el, 
                  { scale: 0, rotation: -180, opacity: 0 },
                  { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
                );
              }
            }}
            style={{
              position: 'absolute',
              width: '300px',
              height: '216px',
              backgroundColor: '#22c55e',
              borderRadius: '8px',
              border: '2px solid #16a34a',
              top: 'calc(50% + 40px)', // Same vertical position as before
              left: 'calc(50% + 200px)', // Center of left ellipse
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              color: 'white',
              padding: '10px',
              boxSizing: 'border-box'
            }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {selectedButton}
            </div>
            <div style={{
              fontSize: '14px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              This is temporary text underneath the title. It provides additional context and information about the selected topic.
            </div>
          </div>
          
          {/* Grey rectangle - positioned over right ellipse */}
          <div 
            ref={(el) => {
              if (el && selectedButton) {
                // All rectangles use the same animation as journalism grey rectangle
                gsap.fromTo(el, 
                  { scale: 0, rotation: -180, opacity: 0 },
                  { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
                );
              }
            }}
            style={{
              position: 'absolute',
              width: '300px',
              height: '216px',
              backgroundColor: '#9ca3af',
              borderRadius: '20px',
              border: '3px solid #6b7280',
              top: 'calc(50% + 40px)', // Same vertical position as before
              right: 'calc(50% + 200px)', // Center of right ellipse
              transform: 'translate(50%, -50%)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              color: 'white',
              padding: '10px',
              boxSizing: 'border-box'
            }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {selectedButton}
            </div>
            <div style={{
              fontSize: '14px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              This is temporary text underneath the title. It provides additional context and information about the selected topic.
            </div>
          </div>
        </>
      )}

    </div>
  );
}
