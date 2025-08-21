'use client'

import { useEffect, useState } from 'react'
import { useConnect } from 'wagmi'
import { addFarcasterConnector } from '../config/wagmi'

export default function FarcasterConnector() {
  const [connector, setConnector] = useState(null)
  const [loading, setLoading] = useState(false)
  const { connect, isPending } = useConnect()

  useEffect(() => {
    // Load the Farcaster connector dynamically
    const loadConnector = async () => {
      try {
        setLoading(true)
        const farcasterConnector = await addFarcasterConnector()
        if (farcasterConnector) {
          setConnector(farcasterConnector)
          console.log('Farcaster connector loaded successfully')
        }
      } catch (error) {
        console.error('Failed to load Farcaster connector:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only load on client side
    if (typeof window !== 'undefined') {
      loadConnector()
    }
  }, [])

  const handleConnect = () => {
    if (connector) {
      connect({ connector })
    }
  }

  if (loading) {
    return <div>Loading Farcaster connector...</div>
  }

  if (!connector) {
    return <div>Farcaster connector not available</div>
  }

  return (
    <div>
      <button 
        onClick={handleConnect}
        disabled={isPending}
        style={{
          padding: '10px 20px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {isPending ? 'Connecting...' : 'Connect Farcaster'}
      </button>
    </div>
  )
}
