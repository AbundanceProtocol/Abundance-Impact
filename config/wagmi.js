'use client'

import { http, createConfig } from 'wagmi'
import { base, celo, optimism, arbitrum } from 'wagmi/chains'

// Note: This config is for Wagmi v2
// Farcaster connector will be added dynamically on client side
console.log('Wagmi config loaded');

export const config = createConfig({
  chains: [base, celo, optimism, arbitrum],
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  connectors: [] // Initialize with empty connectors
})

// Add Farcaster connector dynamically on client side
export async function addFarcasterConnector() {
  try {
    const { farcasterMiniApp } = await import('@farcaster/miniapp-wagmi-connector')
    return farcasterMiniApp()
  } catch (error) {
    console.warn('Farcaster connector not available:', error)
    return null
  }
}