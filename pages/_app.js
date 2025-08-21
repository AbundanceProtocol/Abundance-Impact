import '../styles/index.css'
import React, { useEffect, useState, useRef } from 'react'
import { AccountProvider } from '../context'
import Layout from '../components/Layout'

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

  return (
    <AccountProvider initialAccount={initialAccount} ref1={ref1} cookies={pageProps.cookies}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AccountProvider>
  )
}

// Force SSR for all pages to prevent static generation issues with client-only code
App.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {}
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx)
  }
  // Pass cookies to initial state for Wagmi
  if (ctx.req && ctx.req.headers.cookie) {
    pageProps.cookies = ctx.req.headers.cookie
  }
  return { pageProps }
}
