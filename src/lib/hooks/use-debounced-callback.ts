import { useCallback, useRef, useEffect } from 'react'

/**
 * Callback that will only execute the callback if the delay has passed and no other callback has been executed within the delay.
 */
export const useDebouncedCallback = <T extends (...args: any[]) => void>(debouncedFn: T, delay: number) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // clear timeout on dependencies change
  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
  }, [debouncedFn, delay])

  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      debouncedFn(...args)
    }, delay)
  }, [debouncedFn, delay])
}
