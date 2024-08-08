import React, { useContext } from "react";
import useStore from "../../../utils/store";
import { AccountContext } from "../../../context";
import { FaLock } from "react-icons/fa";

const FeedMenu = ({ buttonName, searchSelect, searchOption, isMobile }) => {
  const store = useStore()
  const { LoginPopup } = useContext(AccountContext)
  let isSearchable = true
  let comingSoon = false
  // if ((buttonName == 'Casts' && !store.isAuth) || (buttonName == 'Casts + Replies' && !store.isAuth)) {
  //   isSearchable = false
  // }

  return (
    isSearchable ? (
      <>{comingSoon ? (<div className='flex-row' style={{position: 'relative'}}><div className={(searchSelect == buttonName) ? 'active-nav-link btn-hvr lock-btn-hvr' : 'nav-link btn-hvr lock-btn-hvr'} onClick={searchOption} name={buttonName} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '14px' : '15px'}}>{buttonName}</div>
      <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(20%, -50%)' }}>
        <div className='soon-btn'>SOON</div>
      </div>
    </div>) : (
      <div className={(searchSelect == buttonName) ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'} onClick={searchOption} name={buttonName} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '14px' : '15px'}}>{buttonName}</div>)}</>
    ) : (
      <div className='flex-row' style={{position: 'relative'}}>
        <div className='lock-btn-hvr' name={buttonName} style={{color: '#bbb', fontWeight: '600', padding: '5px 14px', borderRadius: '14px', cursor: 'pointer', fontSize: isMobile ? '14px' : '15px'}} onClick={LoginPopup}>{buttonName}</div>
        <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-20%, -50%)' }}>
          <FaLock size={8} color='#999' />
        </div>
      </div>
    )
  )
}

export default FeedMenu;