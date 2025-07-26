import React, { useContext } from 'react';
import { BsPiggyBankFill } from "react-icons/bs";
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const version = process.env.NEXT_PUBLIC_VERSION

const AutoFundInfo = () => {
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
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "0px 0 0 4px",
              margin: '0 0 0px 0'
            }} >

            <BsPiggyBankFill style={{ fill: "#cde" }} size={20} />

            <div>
              <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                <div className="top-layer flex-row">
                  <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                    <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                      Auto-fund
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
        </div>
      </div>
    </div>)
  );
};

export default AutoFundInfo;
