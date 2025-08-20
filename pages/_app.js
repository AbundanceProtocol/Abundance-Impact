import '../styles/index.css'
import React, { useEffect, useState, useRef } from 'react'

export default function App({ Component, pageProps }) {
  const initialAccount = { points: '$IMPACT', qdau: 0, impact: 0 }

  const ref = useRef(null)
  const ref1 = useRef(null)

  const [bottomNavSize, setBottomNavSize] = useState(0)
  const [navSize, setNavSize] = useState(1060)
  const [navWidth, setNavWidth] = useState(0)

  useEffect(() => {
    function handleNavResize() {
      if (!ref.current) return
      const width = ref.current.offsetWidth
      setBottomNavSize(width)
      setNavSize(width - 60)
      setNavWidth((width - 1312) / 2 - 167)
    }

    handleNavResize()
    window.addEventListener('resize', handleNavResize)
    return () => window.removeEventListener('resize', handleNavResize)
  }, [])

  // Allow meta-only pages to opt-out of global providers for SSR safety
  if (Component?.disableProviders) {
    return <Component {...pageProps} />
  }

  // Lazy load providers and layout so SSR for meta-only pages doesn't import them
  const { AccountProvider } = require('../context')
  const Layout = require('../components/Layout').default

  return (
    <AccountProvider initialAccount={initialAccount} ref1={ref1}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AccountProvider>
  )
}
