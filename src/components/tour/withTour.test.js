import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { STATUS } from 'react-joyride'
import withTour from './withTour.js'

// Mock redux-bundler-react
jest.mock('redux-bundler-react', () => ({
  connect: (selectors, component) => {
    const ConnectedComponent = (props) => {
      const mockProps = {
        doDisableTours: jest.fn(),
        ...props
      }
      return React.createElement(component, mockProps)
    }
    ConnectedComponent.displayName = `Connected(${component.displayName || component.name})`
    return ConnectedComponent
  }
}))

// Mock react-joyride
jest.mock('react-joyride', () => ({
  STATUS: {
    FINISHED: 'finished',
    RUNNING: 'running',
    PAUSED: 'paused',
    STOPPED: 'stopped'
  }
}))

// Test component to wrap
const TestComponent = ({ handleJoyrideCallback, testProp }) => {
  return (
    <div>
      <div data-testid="test-component">Test Component</div>
      <button
        data-testid="trigger-callback"
        onClick={() => handleJoyrideCallback({ action: 'close', status: STATUS.FINISHED })}
      >
        Trigger Callback
      </button>
      <div data-testid="test-prop">{testProp}</div>
    </div>
  )
}

describe('withTour', () => {
  let WrappedComponent
  let mockDoDisableTours

  beforeEach(() => {
    mockDoDisableTours = jest.fn()
    WrappedComponent = withTour(TestComponent)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the wrapped component', () => {
    render(<WrappedComponent testProp="test value" />)

    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByTestId('test-prop')).toHaveTextContent('test value')
  })

  it('passes through props to wrapped component', () => {
    render(<WrappedComponent testProp="passed prop" />)

    expect(screen.getByTestId('test-prop')).toHaveTextContent('passed prop')
  })

  it('calls doDisableTours when action is close', () => {
    render(<WrappedComponent />)

    const button = screen.getByTestId('trigger-callback')
    fireEvent.click(button)

    expect(mockDoDisableTours).toHaveBeenCalledTimes(1)
  })

  it('calls doDisableTours when status is FINISHED', () => {
    const WrappedComponentWithCallback = withTour(({ handleJoyrideCallback }) => (
      <button
        data-testid="trigger-finished"
        onClick={() => handleJoyrideCallback({ action: 'next', status: STATUS.FINISHED })}
      >
        Trigger Finished
      </button>
    ))

    render(<WrappedComponentWithCallback />)

    const button = screen.getByTestId('trigger-finished')
    fireEvent.click(button)

    expect(mockDoDisableTours).toHaveBeenCalledTimes(1)
  })

  it('does not call doDisableTours for other actions and statuses', () => {
    const WrappedComponentWithCallback = withTour(({ handleJoyrideCallback }) => (
      <button
        data-testid="trigger-other"
        onClick={() => handleJoyrideCallback({ action: 'next', status: STATUS.RUNNING })}
      >
        Trigger Other
      </button>
    ))

    render(<WrappedComponentWithCallback />)

    const button = screen.getByTestId('trigger-other')
    fireEvent.click(button)

    expect(mockDoDisableTours).not.toHaveBeenCalled()
  })

  it('has correct display name', () => {
    expect(WrappedComponent.displayName).toBe('Connected(TestComponent)')
  })

  it('handles multiple callback calls', () => {
    render(<WrappedComponent />)

    const button = screen.getByTestId('trigger-callback')

    // Click multiple times
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)

    expect(mockDoDisableTours).toHaveBeenCalledTimes(3)
  })
})
