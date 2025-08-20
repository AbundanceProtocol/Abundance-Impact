import React, { useContext } from 'react';
import { useAppRouter } from '../../../../hooks/useAppRouter';
import { AccountContext } from '../../../../context';
import useStore from '../../../../utils/store';

const LogoutModal = () => {
  const router = useAppRouter();
  const store = useStore()

  const { showLogout, setShowLogout, setFid, setIsLogged, setUserInfo } = useContext(AccountContext);

  const handleLogOut = () => {
    console.log('isLogged-4')

    store.setFid(null)
    store.setIsAuth(false)
    store.setSignerUuid(null)
  
    store.setUsernameFC(null)
    store.setSrcUrlFC(null)
    store.setUserDisplayNameFC(null)
    store.setUserActiveFC(false)
    store.setUserBioFC(null)
    store.setUserFollowersFC(null)
    store.setUserFollowingFC(null)
    store.setUserEthVerAddresses([])
    store.setUserSolVerAddresses([])
    setFid(null)
    setIsLogged(false)
    setShowLogout(false)
    setUserInfo({
      pfp: null,
      username: null,
      display: null,
    })
    if (router.route == '/~/studio') {
      router.push(`/`)
    }
  };

  const closeLogout = () => {
    setShowLogout(false)
  }

  return (
    <div>
      {showLogout && (
        <>
          <div className="overlay" onClick={closeLogout}></div>
          <div id="notificationContainer" style={{borderRadius: '16px', backgroundColor: '#cdd'}}>
            <div className='flex-col' id="notificationContent" style={{alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: '20px', maxWidth: '280px', fontWeight: '500'}}>Are you sure you want to logout of the Impact App?</div>
              <div className='flex-row' style={{width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '16px', gap: '10px'}}>
                <div className='out-btn' onClick={handleLogOut}>Log out</div>
                <div className='cncl-btn' onClick={closeLogout}>Cancel</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LogoutModal;