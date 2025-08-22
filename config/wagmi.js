'use client'

import { http, createConfig } from 'wagmi'
import { base, celo, optimism, arbitrum } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

console.log('Wagmi config loaded');

export const config = createConfig({
  chains: [base, celo, optimism, arbitrum],
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  connectors: [
    // Include injected connector for local development
    injected()
  ]
})

// Function to dynamically add Farcaster connector (client-side only)
export async function addFarcasterConnector() {
  if (typeof window === 'undefined') {
    console.warn('addFarcasterConnector called on server side')
    return null
  }

  try {
    console.log('🔄 Importing @farcaster/miniapp-wagmi-connector...')
    const module = await import('@farcaster/miniapp-wagmi-connector')
    console.log('✅ Successfully imported module:', Object.keys(module))
    
    const { farcasterMiniApp } = module
    console.log('✅ Successfully imported farcasterMiniApp function:', typeof farcasterMiniApp)
    
    // Check if we're in the right environment
    console.log('🔍 Environment check:', {
      hasFarcasterProvider: !!window.farcasterEthProvider,
      hasEthereum: !!window.ethereum,
      userAgent: navigator.userAgent.includes('Farcaster')
    })
    
    console.log('🔄 Creating Farcaster connector...')
    const connector = farcasterMiniApp()
    console.log('✅ Farcaster connector created:', {
      connector: !!connector,
      id: connector?.id,
      name: connector?.name,
      type: connector?.type,
      connect: typeof connector?.connect,
      getProvider: typeof connector?.getProvider
    })
    
    // Test if connector has required methods
    if (connector && typeof connector.connect === 'function') {
      console.log('✅ Connector has connect method')
    } else {
      console.warn('⚠️ Connector missing connect method')
    }
    
    return connector
  } catch (error) {
    console.warn('❌ Farcaster connector not available:', error)
    console.warn('Error details:', error.message)
    console.warn('Error stack:', error.stack)
    return null
  }
}