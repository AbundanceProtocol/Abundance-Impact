import { http, createConfig } from 'wagmi'
import { base, celo, optimism, arbitrum } from 'wagmi/chains'

// Load real connector on client, stub on server
let farcasterMiniAppFactory = null
try {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { farcasterMiniApp } = require('@farcaster/miniapp-wagmi-connector')
    farcasterMiniAppFactory = farcasterMiniApp
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { farcasterMiniApp } = require('../utils/miniapp-wagmi-connector-server-stub.js')
    farcasterMiniAppFactory = farcasterMiniApp
  }
} catch (_) {
  farcasterMiniAppFactory = null
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
  connectors: farcasterMiniAppFactory ? [farcasterMiniAppFactory()] : []
})