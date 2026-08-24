import { useCallback, useEffect, useRef, useState } from 'react'

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Generic async data hook — wraps a service call with loading/error/success/empty semantics
 * so pages don't hand-roll fetch state each time. Swappable when moving to real API (React Query, etc.)
 */
export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<Error | null>(null)
  const mounted = useRef(true)

  const run = useCallback(() => {
    setStatus('loading')
    setError(null)
    fn()
      .then((res) => {
        if (!mounted.current) return
        setData(res)
        setStatus('success')
      })
      .catch((err) => {
        if (!mounted.current) return
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setStatus('error')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mounted.current = true
    run()
    return () => {
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, status, error, refetch: run, isLoading: status === 'loading', isError: status === 'error' }
}

export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
