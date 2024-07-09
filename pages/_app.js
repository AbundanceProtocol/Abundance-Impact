import '../styles/index.css';
import React, { useCallback, useState, useEffect, useRef } from 'react'
import { AccountProvider } from '../context'
import useAuth from '../hooks/useAuth';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  const initialAccount = {points: '$IMPACT', qdau: 0, impact: 0}
  const auth = useAuth();
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

  function handleResize() {
    setNavSize(ref?.current?.offsetWidth - 60)
  }

  const testButton = async () => {
    // console.log('test')
    // try {
    //   const guild = await axios.get('/api/ecosystem/getGuildPoints')
    //   console.log(guild)
    // } catch (error) {
    //   console.error('Error', error)
    // }
  }
    
  const connect = async () => {
    await auth.connect()
  }


  return (
    <AccountProvider initialAccount={initialAccount} ref1={ref1} >
      <Layout>
        <Component {...pageProps} connect={connect} />
      </Layout>
    </AccountProvider>
  )
}