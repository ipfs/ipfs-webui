import React from 'react'
import ErrorIcon from '../../icons/GlyphSmallCancel'

interface ErrorBoundaryProps {
  /**
   * Component that receives { error } (optional).
   */
  fallback?: React.ComponentType<{ error?: Error }>
  /**
   * When these values change, the boundary resets.
   */
  resetKeys?: ReadonlyArray<unknown>
  /**
   * Called when an error is caught
   */
  onError?: (error: Error, info: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  error?: Error
  componentStack?: string
}

const FallbackComponent: React.FC<{ error?: Error; componentStack?: string }> = ({ error, componentStack }) => (
  <div role='alert' className='pa3 br2 ba b--red bg-washed-red flex items-center'>
    <span className='mr2'>
      <ErrorIcon className='h2 w2' aria-hidden />
    </span>

    <pre
      className='ma0 f6 code lh-copy overflow-auto'
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      title={error?.message}
    >
      {error?.message ?? ''}
      {componentStack ? ` - ${componentStack}` : ''}
    </pre>
  </div>
)

function shallowEq (a?: ReadonlyArray<unknown>, b?: ReadonlyArray<unknown>) {
  if (a === b) return true
  if (!a || !b || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: undefined }

  static getDerivedStateFromError (error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch (error: Error, info: React.ErrorInfo) {
    console.error(`${error.message} - ${info.componentStack}`)
    // only use the first line of the component stack for rendering the fallback
    this.setState({ componentStack: info.componentStack.split('\n')[0].trim() })
    this.props.onError?.(error, info)
  }

  componentDidUpdate (prevProps: ErrorBoundaryProps) {
    // Auto-reset when resetKeys change and we’re currently showing a fallback
    if (this.state.error && !shallowEq(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: undefined })
    }
  }

  render () {
    const { error, componentStack } = this.state
    const { children, fallback: Fallback = FallbackComponent } = this.props
    return error != null ? <Fallback error={error} componentStack={componentStack} /> : (children as React.ReactElement | null)
  }
}

export default ErrorBoundary
