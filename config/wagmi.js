import { http, createConfig } from 'wagmi'
import { base, celo, optimism, arbitrum } from 'wagmi/chains'

// Avoid importing the Farcaster connector ESM on the server; use a stub instead
let farcasterConnectorFactory = null
try {
  if (typeof window !== 'undefined') {
    // Client: load real connector
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { farcasterMiniApp } = require('@farcaster/miniapp-wagmi-connector')
    farcasterConnectorFactory = farcasterMiniApp
  } else {
    // Server: load stub connector
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { farcasterMiniApp } = require('../utils/miniapp-wagmi-connector-server-stub.js')
    farcasterConnectorFactory = farcasterMiniApp
  }
} catch (_) {
  // Fallback to no connector
  farcasterConnectorFactory = null
}

// Note: This config is for Wagmi v2
// Make sure you have the correct version of @farcaster/miniapp-wagmi-connector
console.log('Wagmi config loaded with Farcaster connector');

export const config = createConfig({
  chains: [base, celo, optimism, arbitrum],
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  connectors: farcasterConnectorFactory ? [farcasterConnectorFactory()] : []
})