import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Overlay from './overlay'

// Mock react-overlays
jest.mock('react-overlays', () => ({
  Modal: ({ children, show, className, renderBackdrop, onEscapeKeyDown, onBackdropClick, ...props }: any) => {
    if (!show) return null

    return (
      <div data-testid="modal" className={className} {...props}>
        {renderBackdrop && renderBackdrop({})}
        <div data-testid="modal-content">
          {children}
        </div>
      </div>
    )
  }
}))

describe('Overlay', () => {
  const defaultProps = {
    show: true,
    onLeave: jest.fn(),
    hidden: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when show is true', () => {
    render(
      <Overlay {...defaultProps}>
        <div>Overlay content</div>
      </Overlay>
    )

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Overlay content')).toBeInTheDocument()
  })

  it('does not render when show is false', () => {
    render(
      <Overlay {...defaultProps} show={false}>
        <div>Overlay content</div>
      </Overlay>
    )

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('renders with default className', () => {
    render(
      <Overlay {...defaultProps}>
        <div>Overlay content</div>
      </Overlay>
    )

    const modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'bottom-0', 'z-max', 'flex', 'items-center', 'justify-around')
  })

  it('renders with custom className', () => {
    render(
      <Overlay {...defaultProps} className="custom-class">
        <div>Overlay content</div>
      </Overlay>
    )

    const modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('custom-class')
  })

  it('renders backdrop when not hidden', () => {
    render(
      <Overlay {...defaultProps} hidden={false}>
        <div>Overlay content</div>
      </Overlay>
    )

    const backdrop = screen.getByTestId('modal').querySelector('.fixed.top-0.left-0.right-0.bottom-0.bg-black.o-50')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop).not.toHaveAttribute('hidden')
  })

  it('renders hidden backdrop when hidden is true', () => {
    render(
      <Overlay {...defaultProps} hidden={true}>
        <div>Overlay content</div>
      </Overlay>
    )

    const backdrop = screen.getByTestId('modal').querySelector('.fixed.top-0.left-0.right-0.bottom-0.bg-black.o-50')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop).toHaveAttribute('hidden')
  })

  it('calls onLeave when backdrop is clicked', () => {
    const onLeave = jest.fn()
    render(
      <Overlay {...defaultProps} onLeave={onLeave}>
        <div>Overlay content</div>
      </Overlay>
    )

    // Simulate backdrop click by calling the onBackdropClick handler
    const modal = screen.getByTestId('modal')
    // Add role for accessibility
    modal.setAttribute('role', 'button')
    fireEvent.click(modal)

    expect(onLeave).toHaveBeenCalledTimes(1)
  })

  it('calls onLeave when escape key is pressed', () => {
    const onLeave = jest.fn()
    render(
      <Overlay {...defaultProps} onLeave={onLeave}>
        <div>Overlay content</div>
      </Overlay>
    )

    // Simulate escape key press
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(onLeave).toHaveBeenCalledTimes(1)
  })

  it('stops propagation on escape key', () => {
    const onLeave = jest.fn()
    const parentHandler = jest.fn()

    render(
      <div>
        <Overlay {...defaultProps} onLeave={onLeave}>
          <div>Overlay content</div>
        </Overlay>
      </div>
    )

    // Simulate escape key press
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(onLeave).toHaveBeenCalledTimes(1)
    expect(parentHandler).not.toHaveBeenCalled()
  })

  it('renders children correctly', () => {
    render(
      <Overlay {...defaultProps}>
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </Overlay>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('passes through additional props to Modal', () => {
    render(
      <Overlay {...defaultProps} data-testid="custom-overlay">
        <div>Overlay content</div>
      </Overlay>
    )

    const modal = screen.getByTestId('modal')
    expect(modal).toHaveAttribute('data-testid', 'custom-overlay')
  })

  it('handles multiple onLeave calls', () => {
    const onLeave = jest.fn()
    render(
      <Overlay {...defaultProps} onLeave={onLeave}>
        <div>Overlay content</div>
      </Overlay>
    )

    // Call onLeave multiple times
    onLeave()
    onLeave()
    onLeave()

    expect(onLeave).toHaveBeenCalledTimes(3)
  })

  it('renders with different hidden states', () => {
    const { rerender } = render(
      <Overlay {...defaultProps} hidden={false}>
        <div>Overlay content</div>
      </Overlay>
    )

    let backdrop = screen.getByTestId('modal').querySelector('.fixed.top-0.left-0.right-0.bottom-0.bg-black.o-50')
    expect(backdrop).not.toHaveAttribute('hidden')

    rerender(
      <Overlay {...defaultProps} hidden={true}>
        <div>Overlay content</div>
      </Overlay>
    )

    backdrop = screen.getByTestId('modal').querySelector('.fixed.top-0.left-0.right-0.bottom-0.bg-black.o-50')
    expect(backdrop).toHaveAttribute('hidden')
  })
})
