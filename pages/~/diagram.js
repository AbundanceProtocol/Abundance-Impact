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

  // Per-button content for each rectangle
  const rectangleContent = {
    'medicine': {
      leftTitle: 'medicine → abundance',
      leftBody: 'preventive care, open research, equitable access',
      rightTitle: 'medicine → current',
      rightBody: 'patents, paywalls, reactive treatment'
    },
    'social media': {
      leftTitle: 'social media → abundance',
      leftBody: 'authentic identity, shared value, healthy discourse',
      rightTitle: 'social media → current',
      rightBody: `monetizing attention (instead of value) leads to perverse incentives for the platform and for users.\n\nthe platform's algos boost the most engaging content (which in a lot of cases is content with most drama/conflict)\n\nusers likewise have incentive to produce outrage porn, polarizing and controversial content instead of focusing on value creation`
    },
    'innovation': {
      leftTitle: 'innovation → abundance',
      leftBody: 'public goods, open-source, compounding knowledge',
      rightTitle: 'innovation → current',
      rightBody: `suppose you come up with a new way to manufacture shoes that reduces material costs by 25%.\n\nIs your innovation something that only benefits shoe producers? Not really.\n\nBecause if you were to release this innovation as a public good it would reduce manufacturing cost (producers can lower price of shoes and get more demand), it would benefit consumers (cheaper shoes), and it would benefit the wider public (cheaper materials).\n\nBut only producers are likely to buy your innovation, thus capturing all the value for themselves (reducing margins without significant benefits to consumers or the wider public).\n\nThat's the dynamic in the market today. Any public good that can benefit wider society is turned into profits by commercial interests, to the detriment of the wider public (if an alternative public goods option existed)`
    },
    'purpose': {
      leftTitle: 'purpose → abundance',
      leftBody: 'mission-aligned capital and coordination',
      rightTitle: 'purpose → current',
      rightBody: `what happens when you can work for the benefit of narrow corporate interests, or sell products and services to customers directly, but you cannot do work (or, at least can't get compensated for work) that benefits the common good?\n\nYou get a sense that your contribution in the market economy does not serve the interests of society. Instead it can come at the expense of society at times\n\nThis can lead to a crisis of meaning and disillusionment with the system`
    },
    'digital tech': {
      leftTitle: 'digital tech → abundance',
      leftBody: 'composability, interoperability, low marginal cost',
      rightTitle: 'digital tech → current',
      rightBody: `the most "efficient" way to distribute software is to make it available as Open Source Software (OSS)\n\nyet, you cannot monetize software as open source\n\nso the most efficient way to distribute software is also the least effective way to make money with software\n\nthere are companies that make money by providing services on top of OSS, but that just reinforces the fact that the underlying value of the OSS is not getting rewarded in the economy\n\nwhat we get instead is an incentive for companies to sell proprietary software and to work in silos - so they can sell access to the software and make money from the restrictions they introduce\n\ninstead of maximizing impact and efficient resource allocation, there is a tradeoff in the economy between profitability in efficiency`
    },
    'AI': {
      leftTitle: 'AI → abundance',
      leftBody: 'assistive intelligence for everyone',
      rightTitle: 'AI → current',
      rightBody: `while the technology is incredibly powerful, and could benefit society immensely, companies that develop LLMs are not compensated for their work by "society."\n\nThey are compensated by selling subscriptions to individuals, companies (and sometimes governments).\n\nAs competition in the sector intensifies, we're likely to see companies engage in more behavior that is misaligned with the public interest (eg. scraping copyrighted data, working for powerful interests to manipulate public opinion with "bot armies," govt surveillance, etc.)\n\nthe companies that push these behaviors to the extreme are also likely to be the ones most profitable, thus creating a race to the bottom`
    },
    'journalism': {
      leftTitle: 'journalism → abundance',
      leftBody: 'public-interest funding, provenance, credibility',
      rightTitle: 'journalism → current',
      rightBody: 'click economy, polarization'
    },
    'science': {
      leftTitle: 'science → abundance',
      leftBody: 'open science, reproducibility, rapid iteration',
      rightTitle: 'science → current',
      rightBody: `though some research may be fantastically beneficial to society, it's not the value of the research that determines funding but rather other factors - the ability to get grants (based on the priorities of government), magazine publication priorities, etc.`
    },
    'alignment': {
      leftTitle: 'alignment → abundance',
      leftBody: 'values-first markets and mechanisms',
      rightTitle: 'alignment → current',
      rightBody: 'externalities and mispricing'
    },
    'value': {
      leftTitle: 'value → abundance',
      leftBody: 'measure impact beyond price',
      rightTitle: 'value → current',
      rightBody: 'narrow financial metrics'
    },
    'efficiency': {
      leftTitle: 'efficiency → abundance',
      leftBody: 'optimize for coordination and reuse',
      rightTitle: 'efficiency → current',
      rightBody: 'optimize isolated silos'
    },
    'resources': {
      leftTitle: 'resources → abundance',
      leftBody: 'regenerative loops, commons stewardship',
      rightTitle: 'resources → current',
      rightBody: 'extraction and depletion'
    },
    'relations': {
      leftTitle: 'relations → abundance',
      leftBody: 'trust networks, cooperative games',
      rightTitle: 'relations → current',
      rightBody: 'zero-sum framing, adversarial dynamics'
    }
  };

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
      <style>{`
        /* WebKit-based browsers */
        .rectBodyLeft::-webkit-scrollbar,
        .rectBodyRight::-webkit-scrollbar {
          width: 10px;
          border-radius: 8px;
        }
        .rectBodyLeft::-webkit-scrollbar-track {
          background: #27d165; /* slightly lighter than #22c55e */
          border-radius: 8px;
        }
        .rectBodyLeft::-webkit-scrollbar-thumb {
          background: #ffffff; /* white */
          border-radius: 8px;
        }
        /* Rounded outer ends (the "arrows") */
        .rectBodyLeft::-webkit-scrollbar-button:single-button {
          background: #27d165;
          display: block;
          height: 10px;
          border-radius: 8px;
        }
        .rectBodyRight::-webkit-scrollbar-track {
          background: #a7b0ba; /* slightly lighter than #9ca3af */
          border-radius: 8px;
        }
        .rectBodyRight::-webkit-scrollbar-thumb {
          background: #ffffff; /* white */
          border-radius: 8px;
        }
        .rectBodyRight::-webkit-scrollbar-button:single-button {
          background: #a7b0ba;
          display: block;
          height: 10px;
          border-radius: 8px;
        }

        /* Firefox */
        .rectBodyLeft,
        .rectBodyRight {
          scrollbar-width: thin;
          scrollbar-color: #ffffff #27d165; /* thumb track */
        }
        .rectBodyRight {
          scrollbar-color: #ffffff #a7b0ba; /* thumb track */
        }
      `}</style>
      {/* Buttons */}
      <div style={{
        position: 'absolute',
        top: 'calc(50vh - 200px - 2rem - 20px)', // Much closer to ellipses
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
          padding: '20px 40px 60px 40px',
          left: 'calc(50% - 82px)', // Moved 2% closer (12px more left)
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}
      >
        <h2 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2', textAlign: 'center' }}>
          abundance<br />
          economy
        </h2>
        <img 
          src="/images/abundanceisland01.png" 
          alt="Abundance Economy" 
          style={{
            width: '60%',
            height: '60%',
            objectFit: 'cover',
            borderRadius: '50%',
            opacity: 0
          }}
        />
        {/* Overlay checkmarks */}
        <div style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'white', fontSize: '21px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '30px', color: '#b4eabf' }}>✓</span>
            <span>consumer goods</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'white', fontSize: '21px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '30px', color: '#b4eabf' }}>✓</span>
            <span>commercial goods</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'white', fontSize: '21px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '30px', color: '#b4eabf' }}>✓</span>
            <span>ecosystem goods</span>
          </div>
        </div>
        
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
          padding: '20px 40px 60px 40px',
          right: 'calc(50% - 82px)', // Moved 2% closer (12px more right)
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}
      >
        <h2 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2', textAlign: 'center' }}>
          current<br />
          economy
        </h2>
        <img 
          src="/images/ScarcityIsland04.png" 
          alt="Current Economic Paradigm" 
          style={{
            width: '60%',
            height: '60%',
            objectFit: 'cover',
            borderRadius: '50%',
            opacity: 0
          }}
        />
        {/* Overlay checkmarks and X */}
        <div style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'white', fontSize: '21px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '30px', color: '#b4eabf' }}>✓</span>
            <span>consumer goods</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'white', fontSize: '21px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '30px', color: '#b4eabf' }}>✓</span>
            <span>commercial goods</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'white', fontSize: '21px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '30px', color: '#ee7777' }}>✗</span>
            <span>ecosystem goods</span>
          </div>
        </div>
        
      </div>

      {/* Bottom buttons - positioned similar to top buttons */}
      <div style={{
        position: 'absolute',
        top: 'calc(50vh + 200px + 2rem)', // Below ellipses with similar spacing
        left: '0',
        right: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        {/* First row */}
        <div style={{
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => handleButtonClick('alignment')}
            style={{
              padding: '8px 17px',
              backgroundColor: selectedButton === 'alignment' ? '#16a34a' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            alignment
          </button>
          <button
            onClick={() => handleButtonClick('value')}
            style={{
              padding: '8px 17px',
              backgroundColor: selectedButton === 'value' ? '#16a34a' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            value
          </button>
          <button
            onClick={() => handleButtonClick('efficiency')}
            style={{
              padding: '8px 17px',
              backgroundColor: selectedButton === 'efficiency' ? '#16a34a' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            efficiency
          </button>
        </div>
        
        {/* Second row */}
        <div style={{
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => handleButtonClick('resources')}
            style={{
              padding: '8px 17px',
              backgroundColor: selectedButton === 'resources' ? '#16a34a' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            resources
          </button>
          <button
            onClick={() => handleButtonClick('relations')}
            style={{
              padding: '8px 17px',
              backgroundColor: selectedButton === 'relations' ? '#16a34a' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            relations
          </button>
        </div>
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
              backgroundColor: '#1a5a2a',
              borderRadius: '8px',
              border: '2px solid #16a34a',
              boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
              top: 'calc(50% + 40px)', // Lowered by 5% (20px more down)
              left: 'calc(50% + 218px)', // Updated to match new ellipse position
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
              {(rectangleContent[selectedButton]?.leftTitle) || selectedButton}
            </div>
            <div className="rectBodyLeft" style={{
              fontSize: '14px',
              textAlign: 'justify',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              overflowY: 'auto',
              width: '100%',
              maxHeight: 'calc(100% - 46px)',
              paddingRight: '8px'
            }}>
              {(rectangleContent[selectedButton]?.leftBody) || ''}
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
              backgroundColor: '#4a5568',
              borderRadius: '20px',
              border: '3px solid #6b7280',
              boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
              top: 'calc(50% + 40px)', // Lowered by 5% (20px more down)
              right: 'calc(50% + 218px)', // Updated to match new ellipse position
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
              {(rectangleContent[selectedButton]?.rightTitle) || selectedButton}
            </div>
            <div className="rectBodyRight" style={{
              fontSize: '14px',
              textAlign: 'justify',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              overflowY: 'auto',
              width: '100%',
              maxHeight: 'calc(100% - 46px)',
              paddingRight: '8px'
            }}>
              {(rectangleContent[selectedButton]?.rightBody) || ''}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
