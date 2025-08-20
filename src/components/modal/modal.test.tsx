import { describe, it, expect, jest } from '@jest/globals'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Modal, ModalActions, ModalBody } from './modal'

describe('Modal', () => {
  describe('Modal component', () => {
    it('renders modal container element', () => {
      const { container } = render(<Modal />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders with default props', () => {
      const { container } = render(<Modal />)
      const modalElement = container.firstChild as HTMLElement
      expect(modalElement).toHaveClass('bg-white', 'w-80', 'shadow-4', 'sans-serif', 'relative')
      expect(modalElement).toHaveStyle({ maxWidth: '34em' })
    })

    it('renders with custom className', () => {
      const customClass = 'custom-modal-class'
      const { container } = render(<Modal className={customClass} />)
      const modalElement = container.firstChild as HTMLElement
      expect(modalElement).toHaveClass(customClass)
      expect(modalElement).toHaveClass('bg-white', 'w-80', 'shadow-4', 'sans-serif', 'relative')
    })

    it('renders children correctly', () => {
      render(
        <Modal>
          <div data-testid="test-child">Test Content</div>
        </Modal>
      )
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders cancel icon when onCancel is provided', () => {
      const mockOnCancel = jest.fn()
      const { container } = render(<Modal onCancel={mockOnCancel} />)

      const cancelIcon = container.querySelector('svg')
      expect(cancelIcon).toBeInTheDocument()
      expect(cancelIcon).toHaveClass('absolute', 'pointer', 'w2', 'h2', 'top-0', 'right-0', 'fill-gray')
    })

    it('does not render cancel icon when onCancel is not provided', () => {
      const { container } = render(<Modal />)
      const cancelIcon = container.querySelector('svg')
      expect(cancelIcon).not.toBeInTheDocument()
    })

    it('does not render cancel icon when onCancel is null', () => {
      const { container } = render(<Modal onCancel={null} />)
      const cancelIcon = container.querySelector('svg')
      expect(cancelIcon).not.toBeInTheDocument()
    })

    it('calls onCancel when cancel icon is clicked', () => {
      const mockOnCancel = jest.fn()
      const { container } = render(<Modal onCancel={mockOnCancel} />)

      const cancelIcon = container.querySelector('svg')
      expect(cancelIcon).toBeInTheDocument()

      fireEvent.click(cancelIcon!)
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('passes additional props to the modal container', () => {
      render(<Modal data-testid="modal" aria-label="test modal" />)
      const modalElement = screen.getByTestId('modal')
      expect(modalElement).toHaveAttribute('aria-label', 'test modal')
    })
  })

  describe('ModalActions component', () => {
    it('renders actions container element', () => {
      const { container } = render(<ModalActions />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders with default props', () => {
      const { container } = render(<ModalActions />)
      const actionsElement = container.firstChild as HTMLElement
      expect(actionsElement).toHaveClass('flex', 'justify-between', 'pa2')
      expect(actionsElement).toHaveStyle({ backgroundColor: '#f4f6f8' })
    })

    it('renders with custom justify prop', () => {
      const { container } = render(<ModalActions justify="center" />)
      const actionsElement = container.firstChild as HTMLElement
      expect(actionsElement).toHaveClass('flex', 'justify-center', 'pa2')
    })

    it('renders with custom className', () => {
      const customClass = 'custom-actions-class'
      const { container } = render(<ModalActions className={customClass} />)
      const actionsElement = container.firstChild as HTMLElement
      expect(actionsElement).toHaveClass(customClass)
      expect(actionsElement).toHaveClass('flex', 'justify-between', 'pa2')
    })

    it('renders children correctly', () => {
      render(
        <ModalActions>
          <button data-testid="test-button">Test Button</button>
        </ModalActions>
      )
      expect(screen.getByTestId('test-button')).toBeInTheDocument()
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('passes additional props to the actions container', () => {
      render(<ModalActions data-testid="actions" aria-label="test actions" />)
      const actionsElement = screen.getByTestId('actions')
      expect(actionsElement).toHaveAttribute('aria-label', 'test actions')
    })

    it('applies default styling classes and background color', () => {
      const { container } = render(<ModalActions />)
      const actionsElement = container.firstChild as HTMLElement
      expect(actionsElement).toHaveClass('flex', 'justify-between', 'pa2')
      expect(actionsElement.className).toBe('flex justify-between pa2 ')
    })
  })

  describe('ModalBody component', () => {
    it('renders body container element', () => {
      const { container } = render(<ModalBody />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders with default props', () => {
      const { container } = render(<ModalBody />)
      const bodyElement = container.firstChild as HTMLElement
      expect(bodyElement).toHaveClass('ph4', 'pv3', 'tc')
    })

    it('renders with custom className', () => {
      const customClass = 'custom-body-class'
      const { container } = render(<ModalBody className={customClass} />)
      const bodyElement = container.firstChild as HTMLElement
      expect(bodyElement).toHaveClass(customClass)
      expect(bodyElement).toHaveClass('ph4', 'pv3', 'tc')
    })

    it('renders title correctly', () => {
      const title = 'Test Modal Title'
      render(<ModalBody title={title} />)
      const titleElement = screen.getByText(title)
      expect(titleElement).toBeInTheDocument()
      expect(titleElement).toHaveClass('charcoal', 'fw6', 'truncate')
      expect(titleElement.tagName).toBe('P')
    })

    it('renders title as node correctly', () => {
      const titleNode = <span data-testid="title-node">Custom Title</span>
      render(<ModalBody title={titleNode} />)
      expect(screen.getByTestId('title-node')).toBeInTheDocument()
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders icon when Icon prop is provided', () => {
      const MockIcon: React.FC<{ className?: string }> = ({ className }) => (
        <div data-testid="mock-icon" className={className}>Icon</div>
      )
      const { container } = render(<ModalBody Icon={MockIcon} />)

      const iconContainer = container.querySelector('div.center.bg-snow.br-100.flex.justify-center.items-center')
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveStyle({ width: '80px', height: '80px' })

      const icon = screen.getByTestId('mock-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('fill-gray', 'w3')
    })

    it('does not render icon container when Icon prop is not provided', () => {
      const { container } = render(<ModalBody />)
      const iconContainer = container.querySelector('div.center.bg-snow.br-100.flex.justify-center.items-center')
      expect(iconContainer).not.toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <ModalBody>
          <div data-testid="test-child">Test Content</div>
        </ModalBody>
      )
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders both icon and title together', () => {
      const MockIcon: React.FC<{ className?: string }> = ({ className }) => (
        <div data-testid="mock-icon" className={className}>Icon</div>
      )
      const title = 'Test Title'
      const { container } = render(<ModalBody Icon={MockIcon} title={title} />)

      const iconContainer = container.querySelector('div.center.bg-snow.br-100.flex.justify-center.items-center')
      expect(iconContainer).toBeInTheDocument()

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('passes additional props to the body container', () => {
      render(<ModalBody data-testid="body" aria-label="test body" />)
      const bodyElement = screen.getByTestId('body')
      expect(bodyElement).toHaveAttribute('aria-label', 'test body')
    })

    it('applies default styling classes', () => {
      const { container } = render(<ModalBody />)
      const bodyElement = container.firstChild as HTMLElement
      expect(bodyElement).toHaveClass('ph4', 'pv3', 'tc')
    })
  })

  describe('Integration tests', () => {
    it('renders complete modal with all sub-components', () => {
      const MockIcon: React.FC<{ className?: string }> = ({ className }) => (
        <div data-testid="mock-icon" className={className}>Icon</div>
      )
      const mockOnCancel = jest.fn()

      const { container } = render(
        <Modal onCancel={mockOnCancel} className="test-modal">
          <ModalBody Icon={MockIcon} title="Test Title">
            <p>Modal content</p>
          </ModalBody>
          <ModalActions justify="center" className="test-actions">
            <button>Action 1</button>
            <button>Action 2</button>
          </ModalActions>
        </Modal>
      )

      // Check Modal container
      const modalElement = container.firstChild as HTMLElement
      expect(modalElement).toHaveClass('test-modal')
      expect(modalElement).toHaveClass('bg-white', 'w-80', 'shadow-4', 'sans-serif', 'relative')

      // Check cancel icon
      const cancelIcon = container.querySelector('svg')
      expect(cancelIcon).toBeInTheDocument()

      // Check ModalBody content
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()

      // Check ModalActions content
      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.getByText('Action 2')).toBeInTheDocument()
    })

    it('handles click events correctly in integration', () => {
      const mockOnCancel = jest.fn()

      const { container } = render(
        <Modal onCancel={mockOnCancel}>
          <ModalBody title="Test">
            <p>Content</p>
          </ModalBody>
          <ModalActions>
            <button>Action</button>
          </ModalActions>
        </Modal>
      )

      const cancelIcon = container.querySelector('svg')
      expect(cancelIcon).toBeInTheDocument()

      fireEvent.click(cancelIcon!)
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })
})
