/**
 * Custom hooks for optimized data fetching
 * Reduces unnecessary API calls to save Vercel CPU usage
 */

import { useState, useEffect, useRef, useCallback } from 'react'

type FetchState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

type UseCachedFetchOptions = {
  /** Cache duration in milliseconds (default: 30 seconds) */
  cacheDuration?: number
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number
  /** Whether to fetch immediately on mount */
  fetchOnMount?: boolean
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()

/**
 * Hook for fetching data with built-in caching and debouncing
 * Helps reduce API calls and server CPU usage
 */
export function useCachedFetch<T>(
  url: string,
  options: UseCachedFetchOptions = {}
): FetchState<T> & { refetch: () => Promise<void> } {
  const {
    cacheDuration = 30000, // 30 seconds default
    debounceMs = 300,
    fetchOnMount = true,
  } = options

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: fetchOnMount,
    error: null,
  })

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (skipCache = false) => {
    // Check cache first
    if (!skipCache) {
      const cached = cache.get(url)
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setState({ data: cached.data as T, loading: false, error: null })
        return
      }
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Update cache
      cache.set(url, { data, timestamp: Date.now() })
      
      setState({ data, loading: false, error: null })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return
      }
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch',
      }))
    }
  }, [url, cacheDuration])

  // Debounced fetch for use with search inputs, etc.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const debouncedFetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData()
    }, debounceMs)
  }, [fetchData, debounceMs])

  // Initial fetch
  useEffect(() => {
    if (fetchOnMount) {
      fetchData()
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData, fetchOnMount])

  const refetch = useCallback(async () => {
    await fetchData(true) // Skip cache on manual refetch
  }, [fetchData])

  return { ...state, refetch }
}

/**
 * Debounce a function call
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Clear the fetch cache (useful after mutations)
 */
export function clearFetchCache(urlPattern?: string) {
  if (urlPattern) {
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}
