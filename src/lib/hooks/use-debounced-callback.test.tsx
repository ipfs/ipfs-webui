import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { useDebouncedCallback } from './use-debounced-callback'

/**
 * Test component to render the hook
 */
const TestComponent: React.FC<{
  debouncedFn: (...args: any[]) => void,
  delay: number
}> = ({ debouncedFn, delay }) => {
  const debouncedCallback = useDebouncedCallback(debouncedFn, delay)

  const handleClick = () => {
    debouncedCallback('test-arg', 'second-arg')
  }

  const handleMultipleCalls = () => {
    debouncedCallback('first')
    debouncedCallback('second')
    debouncedCallback('third')
  }

  return (
    <div>
      <button onClick={handleClick} data-testid="single-call">Single Call</button>
      <button onClick={handleMultipleCalls} data-testid="multiple-calls">Multiple Calls</button>
    </div>
  )
}

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('basic debouncing behavior', () => {
    it('should only execute the last call after delay', async () => {
      const mockFn = jest.fn()

      const { getByTestId } = render(
        <TestComponent debouncedFn={mockFn} delay={100} />
      )

      // trigger multiple rapid calls
      fireEvent.click(getByTestId('multiple-calls'))

      // should not have executed yet
      expect(mockFn).not.toHaveBeenCalled()

      // forward time
      jest.advanceTimersByTime(100)

      // should have executed only once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('should forward all arguments to the debounced function', async () => {
      const mockFn = jest.fn()

      const { getByTestId } = render(
        <TestComponent debouncedFn={mockFn} delay={50} />
      )

      fireEvent.click(getByTestId('single-call'))

      // forward time
      jest.advanceTimersByTime(50)

      expect(mockFn).toHaveBeenCalledWith('test-arg', 'second-arg')
    })
  })

  describe('function reference updates', () => {
    it('should call the new function when function reference changes', async () => {
      const mockFn1 = jest.fn()
      const mockFn2 = jest.fn()

      const { getByTestId, rerender } = render(
        <TestComponent debouncedFn={mockFn1} delay={100} />
      )

      fireEvent.click(getByTestId('single-call'))

      jest.advanceTimersByTime(100)

      expect(mockFn1).toHaveBeenCalledWith('test-arg', 'second-arg')
      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).not.toHaveBeenCalled()

      // trigger call for first function and update to new function
      fireEvent.click(getByTestId('single-call'))
      rerender(<TestComponent debouncedFn={mockFn2} delay={100} />)

      jest.advanceTimersByTime(100)
      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).toHaveBeenCalledTimes(0)

      // trigger another call for new function
      fireEvent.click(getByTestId('single-call'))

      // forward time
      jest.advanceTimersByTime(100)

      expect(mockFn2).toHaveBeenCalledWith('test-arg', 'second-arg')
      expect(mockFn2).toHaveBeenCalledTimes(1)
      expect(mockFn1).toHaveBeenCalledTimes(1) // Still only called once
    })
  })

  describe('cleanup on unmount', () => {
    it('should clear timeout on component unmount', () => {
      const mockFn = jest.fn()

      const { getByTestId, unmount } = render(
        <TestComponent debouncedFn={mockFn} delay={100} />
      )

      fireEvent.click(getByTestId('single-call'))

      // unmount before timeout completes
      unmount()

      // forward time
      jest.advanceTimersByTime(100)

      // Function should not have been called
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle zero delay', async () => {
      const mockFn = jest.fn()

      const { getByTestId } = render(
        <TestComponent debouncedFn={mockFn} delay={0} />
      )

      fireEvent.click(getByTestId('single-call'))

      // should execute after next tick
      jest.advanceTimersByTime(0) // to trigger next tick
      expect(mockFn).toHaveBeenCalledWith('test-arg', 'second-arg')
    })

    it('should handle function that throws', async () => {
      const throwingFn = jest.fn().mockImplementation(() => {
        throw new Error('Test error')
      })

      const { getByTestId } = render(
        <TestComponent debouncedFn={throwingFn} delay={50} />
      )

      // fn isnt called for 50ms so it won't throw yet.
      expect(() => fireEvent.click(getByTestId('single-call'))).not.toThrow()

      // forward time - the error will be thrown but caught by the timer
      try {
        jest.advanceTimersByTime(50)
      } catch (error) {
        // expected.. advanceTimersByTime propogates the error thrown within the setTimeout function
      }

      expect(throwingFn).toHaveBeenCalled()
    })

    it('should use new delay for subsequent calls after delay changes', async () => {
      const mockFn = jest.fn()

      const { getByTestId, rerender } = render(
        <TestComponent debouncedFn={mockFn} delay={100} />
      )

      fireEvent.click(getByTestId('single-call'))

      // forward time to let first call execute
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('test-arg', 'second-arg')
      expect(mockFn).toHaveBeenCalledTimes(1)

      rerender(<TestComponent debouncedFn={mockFn} delay={200} />)

      // call with new delay
      fireEvent.click(getByTestId('single-call'))

      // forward time by original delay (should not execute yet)
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)

      // forward remaining time
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(2, 'test-arg', 'second-arg')
    })

    it('should adjust timeout when delay changes while pending', async () => {
      const mockFn = jest.fn()

      const { getByTestId, rerender } = render(<TestComponent debouncedFn={mockFn} delay={100} />)

      fireEvent.click(getByTestId('single-call'))

      // wait 50ms (halfway through original delay)
      jest.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      // change delay to 200ms (it should extend the timeout)
      rerender(<TestComponent debouncedFn={mockFn} delay={200} />)

      // wait another 50ms (the original delay of 100ms has elapsed, but the new delay is 200ms)
      jest.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      // wait another 100ms (total 200ms elapsed, it should execute now)
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test-arg', 'second-arg')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should execute immediately when delay is reduced below elapsed time', async () => {
      const mockFn = jest.fn()

      const { getByTestId, rerender } = render(<TestComponent debouncedFn={mockFn} delay={100} />)

      fireEvent.click(getByTestId('single-call'))

      // wait 50ms (halfway through original delay)
      jest.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      // change delay to 30ms (it should execute immediately since 50ms > 30ms)
      rerender(<TestComponent debouncedFn={mockFn} delay={30} />)

      // it should execute immediately, no need to advance timers
      expect(mockFn).toHaveBeenCalledWith('test-arg', 'second-arg')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})
