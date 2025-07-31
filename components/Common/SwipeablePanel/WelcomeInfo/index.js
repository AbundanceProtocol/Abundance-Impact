import React, { useContext } from 'react';
import ItemWrap from '../../../Ecosystem/ItemWrap';
import Item from '../../../Ecosystem/ItemWrap/Item';
import { BsShieldFillCheck, BsPiggyBankFill, BsStarFill } from "react-icons/bs";
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const version = process.env.NEXT_PUBLIC_VERSION

const WelcomeInfo = () => {
  const { isMiniApp, adminTest } = useContext(AccountContext)
  const { isMobile } = useMatchBreakpoints();

  return (
    (version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

      <div className='shadow flex-col'
        style={{
          backgroundColor: "#002244",
          borderRadius: "15px",
          border: "1px solid #11447799",
          width: isMiniApp || isMobile ? '340px' : '100%',
          margin: isMiniApp || isMobile ? '15px auto 0 auto' : '15px auto 0 auto',
        }} >
        <div
          className="shadow flex-row"
          style={{
            backgroundColor: "#11448888",
            width: isMiniApp || isMobile ? '340px' : '100%',
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px", 
            borderRadius: "15px",
            margin: '0 0 10px 0'
          }} >


          <div
            className="flex-row"
            style={{
              width: isMiniApp || isMobile ? '340px' : '100%',
              justifyContent: "center",
              alignItems: "center",
              padding: "0px 0 0 4px",
              margin: '0 0 0px 0'
            }} >

            {/* <BsPiggyBankFill style={{ fill: "#cde" }} size={20} /> */}

            <div>
              <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                <div className="top-layer flex-row">
                  <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                    <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                      Welcome to Impact 2.0!
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



        <div className='flex-col' style={{backgroundColor: "#002244ff", padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: '#ace', fontSize: '14px', gap: '0rem', position: 'relative', fontWeight: '400'}}>
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
          <div style={{padding: '10px 0', textAlign: 'center', whiteSpace: 'pre-line', width: '80%', margin: '0 auto'}}>
            Start using Impact today and join the value revolution!
          </div>
        </div>
      </div>
    </div>)
  );
};

export default WelcomeInfo;
