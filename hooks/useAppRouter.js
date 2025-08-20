'use client'

import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRouter as usePagesRouter } from 'next/router'
import { useEffect, useState, useMemo, useCallback } from 'react'

export function useAppRouter() {
  const [mounted, setMounted] = useState(false)
  
  // Try to use App Router first
  try {
    const router = useNextRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    // Ensure we have a valid pathname - always provide a safe default
    const safePathname = pathname || '/'
    
    // Memoize the query object to prevent unnecessary re-renders
    const query = useMemo(() => {
      return Object.fromEntries(searchParams?.entries() || [])
    }, [searchParams])
    
    // Memoize the router methods to prevent unnecessary re-renders
    const push = useCallback((url) => router.push(url), [router])
    const replace = useCallback((url) => router.replace(url), [router])
    const back = useCallback(() => router.back(), [router])
    const forward = useCallback(() => router.forward(), [router])
    const refresh = useCallback(() => router.refresh(), [router])
    const prefetch = useCallback((url) => router.prefetch(url), [router])
    
    // Create a stable compatible router object
    const compatibleRouter = useMemo(() => ({
      route: safePathname,
      query,
      push,
      replace,
      back,
      forward,
      refresh,
      prefetch,
    }), [safePathname, query, push, replace, back, forward, refresh, prefetch])
    
    // Set mounted state for client-side rendering
    useEffect(() => {
      setMounted(true)
    }, [])
    
    return compatibleRouter
  } catch (error) {
    // Fallback to Pages Router
    try {
      const pagesRouter = usePagesRouter()
      // Ensure Pages Router also has a safe route
      if (!pagesRouter.route) {
        pagesRouter.route = '/'
      }
      return pagesRouter
    } catch (fallbackError) {
      // Return a minimal router object if both fail
      console.warn('Router not available, using fallback')
      return {
        route: '/',
        query: {},
        push: () => {},
        replace: () => {},
        back: () => {},
        forward: () => {},
        refresh: () => {},
        prefetch: () => {},
      }
    }
  }
}
