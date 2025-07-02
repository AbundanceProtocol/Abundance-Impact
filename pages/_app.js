import '../styles/index.css';
import React, { useCallback, useState, useEffect, useRef } from 'react'
import { AccountProvider } from '../context'
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  const initialAccount = {points: '$IMPACT', qdau: 0, impact: 0}
  const ref = useRef(null)
  const ref1 = useRef(null)
  const [bottomNavSize, setBottomNavSize] = useState(ref?.current?.offsetWidth)
  const [navSize, setNavSize] = useState(1060)
  const [navWidth, setNavWidth] = useState((ref?.current?.offsetWidth - 1312)/2 - 167)

  useEffect(() => {
    setBottomNavSize(ref?.current?.offsetWidth)
    setNavSize(ref?.current?.offsetWidth - 60)

    handleNavResize()
    window.addEventListener("resize", handleNavResize);
    return () => {
      window.removeEventListener("resize", handleNavResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  function handleNavResize() {
    setNavWidth((ref?.current?.offsetWidth - 1312)/2 - 167)
    setBottomNavSize(ref?.current?.offsetWidth)
  }

  useEffect(() => {
    import('@farcaster/miniapp-sdk').then(async (mod) => {
      const { sdk, verifyJwt } = mod;
  
      sdk.actions.ready();
  
      const urlParams = new URLSearchParams(window.location.search);
      const fcJwt = urlParams.get('fc_jwt');
  
      if (!fcJwt) {
        console.log('No fc_jwt found in URL');
        return;
      }
  
      try {
        const session = await verifyJwt(fcJwt);
        if (session?.viewer) {
          console.log('FID:', session.viewer.fid);
          console.log('Username:', session.viewer.username);
          console.log('Wallets:', session.viewer.verifiedAddresses.ethAddresses);
        }
      } catch (error) {
        console.error('Failed to verify JWT:', error);
      }
    });
  }, []);

  return (
    <AccountProvider initialAccount={initialAccount} ref1={ref1} >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AccountProvider>
  )
}