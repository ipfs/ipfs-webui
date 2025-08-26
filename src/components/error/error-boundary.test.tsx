import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorBoundary from './error-boundary'

// Helpers
const Ok: React.FC = () => <div data-testid="ok">ok</div>

const Thrower: React.FC<{ msg?: string }> = ({ msg = 'boom' }) => {
  throw new Error(msg)
}

const CustomFallback: React.FC<{ error?: Error; componentStack?: string }> = ({ error, componentStack }) => (
  <div role="alert">
    <span data-testid="cf-msg">{error?.message}</span>
    <span data-testid="cf-stack">{componentStack ?? ''}</span>
  </div>
)

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Ok />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('ok')).toBeInTheDocument()
  })

  it('renders default fallback UI when a child component throws an error', () => {
    render(
      <ErrorBoundary>
        <Thrower msg="kapow" />
      </ErrorBoundary>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('kapow')
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('calls onError callback with error and component stack info', () => {
    const onError = jest.fn()
    render(
      <ErrorBoundary onError={onError}>
        <Thrower />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledTimes(1)
    const [err, info] = onError.mock.calls[0]
    expect((err as Error).message).toBe('boom')
    expect(info && typeof (info as any).componentStack).toBe('string')
  })

  it('auto-resets error state when resetKeys prop changes', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={[0]}>
        <Thrower />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <ErrorBoundary resetKeys={[1]}>
        <Ok />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('ok')).toBeInTheDocument()
  })

  it('does not reset error state when resetKeys prop remains the same', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={[1, 2, 3]}>
        <Thrower />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <ErrorBoundary resetKeys={[1, 2, 3]}>
        <Ok />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders custom fallback component with error and component stack', () => {
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <Thrower msg="custom-msg" />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('cf-msg')).toHaveTextContent('custom-msg')
    expect(screen.getByTestId('cf-stack')).toBeInTheDocument()
  })

  it('renders default fallback when fallback prop is undefined', () => {
    render(
      <ErrorBoundary fallback={undefined}>
        <Thrower msg="undefined-fallback" />
      </ErrorBoundary>
    )
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('undefined-fallback')
  })

  it('renders nothing when fallback component returns null', () => {
    const NullFallback = () => null
    render(
      <ErrorBoundary fallback={NullFallback}>
        <Thrower msg="null-fallback" />
      </ErrorBoundary>
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('handles error with undefined error message gracefully', () => {
    const ThrowerUndefined: React.FC = () => {
      const error = new Error()
      error.message = undefined as any
      throw error
    }

    render(
      <ErrorBoundary>
        <ThrowerUndefined />
      </ErrorBoundary>
    )
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert.querySelector('pre')).toBeInTheDocument()
  })

  it('renders error message with component stack when available', () => {
    const original = ErrorBoundary.prototype.componentDidCatch
    ErrorBoundary.prototype.componentDidCatch = function (error, info) {
      console.error(`${error.message} - ${info.componentStack}`)
      this.setState({ componentStack: 'at <Thrower />' })
      this.props.onError?.(error, info)
    }

    render(
      <ErrorBoundary>
        <Thrower msg="stacked" />
      </ErrorBoundary>
    )

    const pre = screen.getByRole('alert').querySelector('pre')!
    expect(pre).toHaveTextContent('stacked')
    expect(pre).toHaveTextContent(' - at <Thrower />')

    ErrorBoundary.prototype.componentDidCatch = original
  })

  it('resets error state when resetKeys arrays have different lengths', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={[1, 2, 3]}>
        <Thrower />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Different length arrays should reset
    rerender(
      <ErrorBoundary resetKeys={[1, 2]}>
        <Ok />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('ok')).toBeInTheDocument()
  })
})
