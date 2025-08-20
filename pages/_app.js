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

  // Lazy-load providers and dependencies only when needed
  const { AccountProvider } = require('../context')
  const Layout = require('../components/Layout').default
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query')
  const { WagmiProvider } = require('wagmi')
  const { config: wagmiConfig } = require('./config/wagmi')
  const { cookieToInitialState } = require('@wagmi/core')

  const queryClient = new QueryClient();

  return (
    <AccountProvider initialAccount={initialAccount} ref1={ref1} cookies={pageProps.cookies}>
      <WagmiProvider config={wagmiConfig} initialState={cookieToInitialState(wagmiConfig, pageProps.cookies)}>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </QueryClientProvider>
      </WagmiProvider>
    </AccountProvider>
  )
}

// Force SSR for all pages to prevent static generation issues with client-only code
App.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  // Pass cookies to initial state for Wagmi
  if (ctx.req && ctx.req.headers.cookie) {
    pageProps.cookies = ctx.req.headers.cookie;
  }
  return { pageProps };
};
