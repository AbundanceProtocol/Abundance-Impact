"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

export default function Paradigm() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const containerRef = useRef(null);

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
          the abundance<br />
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
          current economic<br />
          paradigm
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

    </div>
  );
}
