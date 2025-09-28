import React, { useContext } from 'react';
import NeynarSigninButton from '../Signin';
import { AccountContext } from '../../../../context';
import MiniAppAuthButton from '../../../MiniAppAuthButton';
import useStore from '../../../../utils/store';

const LoginModal = () => {
  const { showLogin, isLogged, setShowLogin, setIsLogged, setFid, isMiniApp, checkEcoEligibility, isSignedIn, setIsSignedIn } = useContext(AccountContext);
  const store = useStore()

  const handleSignIn = async (loginData) => {
    console.log('isLogged-5')
    setFid(loginData.fid)
    setIsLogged(true)
    setShowLogin(false)
  };

  const closeLogin = () => {
    setShowLogin(false)
  }

  return (
    <div>
      {showLogin && !isSignedIn && (
        <>
          <div className="overlay" onClick={closeLogin}></div>
          <div id="notificationContainer" style={{borderRadius: '16px', backgroundColor: '#cdd'}}>
            <div className='flex-col' id="notificationContent" style={{alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: '20px', maxWidth: '280px', fontWeight: '500'}}>You&apos;ll need to connect to Farcaster for that</div>
              <div className='flex-row' style={{width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '16px', gap: '10px'}}>
                {isMiniApp ? 
                  (<MiniAppAuthButton
                    onSuccess={(fid, uuid, signers) => {
                      console.log('isLogged-3', fid)
                      store.setFid(fid);
                      store.setSignerUuid(uuid);
                      store.setIsAuth(uuid?.length > 0);
                      console.log('uuid-3', uuid?.length)

                      setFid(fid)
                      setIsLogged(true)
                      setShowLogin(false)
                      if (uuid && uuid?.length > 0) {
                        setIsSignedIn(true)
                      }
                      checkEcoEligibility(fid, '$IMPACT', uuid)
                    }}
                    onError={err => {
                      // Handle error (optional)
                      alert('Login failed: ' + err.message);
                    }}
                  />) : (<NeynarSigninButton onSignInSuccess={handleSignIn} />)}
                <div className='cncl-btn' onClick={closeLogin}>Cancel</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LoginModal;