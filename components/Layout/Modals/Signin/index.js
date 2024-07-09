import { useCallback, useEffect } from 'react';
import useStore from '../../../../utils/store';

const NeynarSigninButton = ({ onSignInSuccess }) => {
  const store = useStore()
  const handleSignInSuccess = useCallback(
    async (data) => {
      try {
        await onSignInSuccess(data);
        store.setUserProfile(data)
        store.setFid(data.fid)
        store.setIsAuth(data.is_authenticated)
        store.setSignerUuid(data.signer_uuid)
      } catch (error) {
        console.error('Sign-in failed:', error);
      }
    },
    [onSignInSuccess],
  );

  useEffect(() => {
    // Load Neynar script
    const script = document.createElement('script');
    script.src = 'https://neynarxyz.github.io/siwn/raw/1.2.0/index.js';
    script.async = true;
    document.body.appendChild(script);
    window.onSignInSuccess = handleSignInSuccess;
    return () => {
      document.body.removeChild(script);
      delete window.onSignInSuccess;
    };
  }, [handleSignInSuccess]); 

  return (
    <div
      className="neynar_signin nynr-btn"
      data-client_id={process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID}
      data-success-callback="onSignInSuccess"
      data-theme="dark" 
      data-variant="farcaster"
      data-logo_size="20px" 
      data-height="32px" 
      data-border_radius="14px" 
      data-font_size="12px" 
      data-font_weight="600" 
      data-color="#fff" 
      data-padding="2px 4px"
      data-background_color="transparent" 
      data-margin="0"
    >
    </div>
  );
};

export default NeynarSigninButton;