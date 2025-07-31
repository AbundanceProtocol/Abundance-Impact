import React, { useContext } from 'react';
import { BsShieldFillCheck } from "react-icons/bs";
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const version = process.env.NEXT_PUBLIC_VERSION

const ValidateInfo = () => {
  const { isLogged, isMiniApp, adminTest } = useContext(AccountContext)
  const { isMobile } = useMatchBreakpoints();

  return (
    (version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

      <div className='shadow flex-col'
        style={{
          backgroundColor: isLogged ? "#002244" : '#333',
          borderRadius: "15px",
          border: isLogged ? "1px solid #11447799" : "1px solid #555",
          width: isMiniApp || isMobile ? '340px' : '100%',
          margin: isMiniApp || isMobile ? '15px auto 0 auto' : '15px auto 0 auto',
        }} >
        <div
          className="shadow flex-row"
          style={{
            backgroundColor: isLogged ? "#11448888" : "#444",
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
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "0px 0 0 4px",
              margin: '0 0 0px 0'
            }} >

            <BsShieldFillCheck style={{ fill: "#cde" }} size={20} />

            <div>
              <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                <div className="top-layer flex-row">
                  <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                    <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                      Validate
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
      </div>
    </div>)
  );
};

export default ValidateInfo;
