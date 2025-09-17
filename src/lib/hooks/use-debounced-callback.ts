import { useCallback, useRef, useEffect } from 'react'

/**
 * Callback that will only execute the callback if the delay has passed and no other callback has been executed within the delay.
 */
export const useDebouncedCallback = <A extends any[], R extends any = void, T extends (...args: A) => R = (...args: A) => R>(debouncedFn: T, delay: number) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const callTimeRef = useRef<number | null>(null)
  const callArgsRef = useRef<A | null>(null)
  // clear timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // clear timeout on function dependency change
  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
  }, [debouncedFn])

  /**
   * reset delay on delay dependency change
   *
   * if delay is less than the elapsed time, execute immediately
   * otherwise, set a new timeout with the remaining time
   */
  useEffect(() => {
    if (timeoutRef.current && callTimeRef.current && callArgsRef.current != null) {
      const callArgs: A = callArgsRef.current
      const elapsed = Date.now() - callTimeRef.current
      const remaining = Math.max(0, delay - elapsed)
      if (remaining <= 0) {
        debouncedFn(...callArgs)
        return
      }

      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        debouncedFn(...callArgs)
      }, remaining)
    }
    // only run this effect when the delay changes.. another hook will handle the function dependency change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay])

  return useCallback((...args: Parameters<T>) => {
    callTimeRef.current = Date.now()
    callArgsRef.current = args
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      debouncedFn(...args)
    }, delay)
  }, [debouncedFn, delay])
}
