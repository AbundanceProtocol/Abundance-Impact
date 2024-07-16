import React, { useContext } from 'react';
import { AccountContext } from '../../../../context';
import useStore from '../../../../utils/store';

const CheckButton = ({ isMobile }) => {
  const { checkEcoEligibility, points, fid, isLogged, LoginPopup } = useContext(AccountContext);
  const store = useStore()

  return (
     
    <div className="flex-row" style={{border: '1px solid #abc', padding: '8px 8px', margin: isMobile ? '30px' : '30px 40px 0px 40px', borderRadius: '10px', justifyContent: 'center', alignItems: 'center', backgroundColor: '#012', cursor: 'pointer'}} onClick={() => {
      if (isLogged) {
        checkEcoEligibility(fid, points, store?.signer_uuid)
      } else {
        LoginPopup()
      }
    }}>
      <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
        <span className="channel-font" style={{color: '#eee'}}>Show Eligibility Criteria</span>
      </div>
    </div>
  )
}

export default CheckButton;