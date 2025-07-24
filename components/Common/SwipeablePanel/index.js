import React, { useContext, useRef, useEffect } from 'react';
import ItemWrap from '../../Ecosystem/ItemWrap';
import Item from '../../Ecosystem/ItemWrap/Item';
import { BsKey, BsLock, BsLockFill, BsXCircle, BsPerson, BsPersonFill, BsShieldCheck, BsShieldFillCheck, BsPiggyBank, BsPiggyBankFill, BsStar, BsStarFill, BsQuestionCircle, BsGift, BsGiftFill } from "react-icons/bs";
import { AccountContext } from '../../../context';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const version = process.env.NEXT_PUBLIC_VERSION

const SwipeablePanel = () => {
  const { isLogged, isMiniApp, userBalances, panelOpen, setPanelOpen, panelTarget, setPanelTarget } = useContext(AccountContext)
  const panelRef = useRef(null);
  const { isMobile } = useMatchBreakpoints();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let startY = 0;
    let currentY = 0;

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 80) {
        closeSwipeable();
      }
    };

    panel.addEventListener('touchstart', onTouchStart);
    panel.addEventListener('touchmove', onTouchMove);

    return () => {
      panel.removeEventListener('touchstart', onTouchStart);
      panel.removeEventListener('touchmove', onTouchMove);
    };
  }, [panelOpen]);



  const closeSwipeable = () => {
    setPanelOpen(false);
    setPanelTarget(null);
  };

  return (
    <div onClick={closeSwipeable}>
      {panelOpen && (
        <div
          
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s',
            zIndex: 999,
          }} />
        )}

        {/* Swipeable Panel */}
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            bottom: panelOpen ? 0 : (panelTarget !== 'welcome') ? '-60%' : '-95%',
            left: '0.5%',
            width: '99%',
            height: (panelTarget !== 'welcome') ? '58%' : '90%',
            backgroundColor: '#55779999',
            backdropFilter: 'blur(12px)',
            borderRadius: '15px 15px 0 0',
            border: '1px solid #468',
            borderBottom: '0',
            padding: '13px 20px 20px 20px',
            margin: '0 0px',
            zIndex: 1000,
            transition: 'bottom 0.3s ease-in-out',
          }}
        >
          <div style={{
            fontSize: '0px',
            height: '4px',
            width: '60px',
            backgroundColor: '#cde',
            borderRadius: '3px',
            margin: '0 auto 10px auto'
          }}>&nbsp;</div>


          {version == '2.0' && (<div className='flex-col' style={{backgroundColor: ''}}>

          <div className='shadow flex-col'
            style={{
              // padding: "8px",
              backgroundColor: (isLogged || panelTarget == 'welcome') ? "#002244" : '#333',
              borderRadius: "15px",
              border: (isLogged || panelTarget == 'welcome') ? "1px solid #11447799" : "1px solid #555",
              width: isMiniApp || isMobile ? '340px' : '100%',
              margin: isMiniApp || isMobile ? '15px auto 0 auto' : '15px auto 0 auto',
              // overflow: 'hidden'
            }}
          >
            <div
              className="shadow flex-row"
              style={{
                backgroundColor: (isLogged || panelTarget == 'welcome') ? "#11448888" : "#444",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px", 
                borderRadius: "15px",
                margin: '0 0 10px 0'
              }} >


              <div
                className="flex-row"
                style={{
                  width: "100%",
                  justifyContent: (panelTarget == 'welcome') ? 'center' : "flex-start",
                  alignItems: "center",
                  padding: "0px 0 0 4px",
                  margin: '0 0 0px 0'
                }} >

                {(panelTarget == 'autoFund') ? (<BsPiggyBankFill style={{ fill: "#cde" }} size={20} />) : (panelTarget == 'validate') ? (<BsShieldFillCheck style={{ fill: "#cde" }} size={20} />) : (panelTarget == 'boost') ? (<BsStarFill style={{ fill: "#cde" }} size={20} />) : (<div></div>)}

                <div>
                  <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                    <div className="top-layer flex-row">
                      <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                        <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                          {(panelTarget == 'autoFund') ? 'Auto-fund' : (panelTarget == 'validate') ? 'Validate' : (panelTarget == 'boost') ? 'Boost & Nominate' : 'Welcome to Impact 2.0!'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div
                  className="flex-row"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }} >
                </div>
              </div>
            </div>



            {(panelTarget == 'autoFund') ? (<div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '14px', gap: '1.25rem', position: 'relative', fontWeight: '400'}}>
              <div>
                Auto-funding lets you automatically send your remaining $degen or $tipn allowances to the Impact Fund
              </div>
              <div>
                @impactfund then distributes the funds to casters in proportion to their impact on Farcaster (per total validated points)
              </div>
              <div className='flex-col'>
                <div>
                  Funders can choose what percent of funds goes to the Creator, Dev and Growth Funds (respectively):
                </div>
                <li>
                  Standard (100/0/0)
                </li>
                <li>
                  Optimized (80/10/10)
                </li>
                <li>
                  Accelerated (60/20/20) 
                </li>
              </div>
            </div>) : (panelTarget == 'validate') ? (
              <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '14px', gap: '1.25rem', position: 'relative', fontWeight: '400'}}>
              <div>
                Every nominated cast must be validated before it can be boosted and earn rewards
              </div>
              <div>
                Impact 2.0 uses Randomized Voter Sampling to validate casts:
              </div>
              <div>
                Each nominated cast is reviewed by a randomized group of validators proportionate to its (proposed) impact
              </div>
              <div>
                If the cast is successfully validated the Proposer's Impact Score increases. If not, the Proposer's Impact Score falls, and nomination allowance decreases
              </div>
            </div>
            ) : (panelTarget == 'boost') ? (
              <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '14px', gap: '1.25rem', position: 'relative', fontWeight: '400'}}>
                <div>
                  Users start with a weekly allowance of 69 nomination points. They can use these to nominate casts based on how impactful they are to the Farcaster network
                </div>
                <div>
                  If validators determine that a cast is fairly valued, it becomes eligible for rewards and is boosted with 'likes' from randomly selected Boosters
                </div>
                <div>
                  Proposers and Boosters earn rewards based on their contribution to the network
                </div>
              </div>
            ) : (<div className='flex-col' style={{backgroundColor: (isLogged || panelTarget == 'welcome') ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: (isLogged || panelTarget == 'welcome') ? '#ace' : '#ddd', fontSize: '16px', gap: '0.0rem', position: 'relative', fontWeight: '400'}}>
              <div style={{padding: '10px 0', textAlign: 'center'}}>
                Impact 2.0 boosts and rewards casters based on the value they create on Farcaster (instead of engagement)
              </div>
              <div style={{padding: '10px 0', textAlign: 'center'}}>
                To achieve this we designed Impact 2.0 to reward users who:
              </div>
              <ItemWrap>
                <Item
                  {...{
                    icon: BsStarFill,
                    text: "Nominate & Boost",
                    description:
                      `proactively surface valuable content (text, code, art, etc.)`,
                  }}
                />
              </ItemWrap>
              <ItemWrap>
                <Item
                  {...{
                    icon: BsShieldFillCheck,
                    text: "Validate",
                    description:
                      `ensure that only quality casts get boosted and rewarded`,
                  }}
                />
              </ItemWrap>
              <ItemWrap>
                <Item
                  {...{
                    icon: BsPiggyBankFill,
                    text: "Fund",
                    description:
                      `Contribute their ($degen & $tipn) allowances and tip (onchain) creators based on their impact thru the app`,
                  }}
                />
              </ItemWrap>
              <div style={{padding: '10px 0', textAlign: 'center'}}>
                Start using Impact today and join the movement!
              </div>
            </div>)}
          </div>
        </div>

        )}

      </div>

    </div>
  );
};

export default SwipeablePanel;
