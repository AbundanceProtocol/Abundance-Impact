'use client'

import { http, createConfig } from 'wagmi'
import { base, celo, optimism, arbitrum } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

// Note: This config is for Wagmi v2
// Farcaster connector will be added dynamically on client side
console.log('Wagmi config loaded');

export const config = createConfig({
  autoConnect: true,
  chains: [base, celo, optimism, arbitrum],
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  // Per Farcaster Miniapps guide – register the mini app connector
  connectors: [
    miniAppConnector(),
    injected()
  ]
})

// Add Farcaster connector dynamically on client side
// Kept for backwards-compat usage; not required when using connectors above
export async function addFarcasterConnector() {
  try {
    const { farcasterMiniApp } = await import('@farcaster/miniapp-wagmi-connector')
    return farcasterMiniApp()
  } catch (error) {
    console.warn('Farcaster connector not available:', error)
    return null
  }
}