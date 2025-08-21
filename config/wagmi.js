import { http, createConfig } from 'wagmi'
import { base, celo, optimism, arbitrum } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

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
  connectors: [
    farcasterMiniApp()
  ]
})