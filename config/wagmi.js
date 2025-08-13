import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Note: This config is for Wagmi v2
// Make sure you have the correct version of @farcaster/miniapp-wagmi-connector
console.log('Wagmi config loaded with Farcaster connector');

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    farcasterMiniApp()
  ]
})