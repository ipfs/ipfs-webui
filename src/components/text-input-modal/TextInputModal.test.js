import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import TextInputModal from './TextInputModal.js'

// Mock the Modal component
jest.mock('../modal/modal.js', () => {
  return {
    Modal: ({ children, onCancel, isOpen }) => (
      isOpen
        ? (
        <div data-testid="modal">
          <button data-testid="modal-cancel" onClick={onCancel}>Cancel</button>
          {children}
        </div>
          )
        : null
    ),
    ModalBody: ({ children }) => <div data-testid="modal-body">{children}</div>,
    ModalActions: ({ children }) => <div data-testid="modal-actions">{children}</div>
  }
})

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  )
}

describe('TextInputModal', () => {
  const defaultProps = {
    isOpen: true,
    onCancel: jest.fn(),
    onSubmit: jest.fn(),
    title: 'Test Modal',
    description: 'Test Description',
    submitText: 'Submit',
    cancelText: 'Cancel'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    i18n.changeLanguage('en')
  })

  it('renders when open', () => {
    renderWithI18n(<TextInputModal {...defaultProps} />)

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithI18n(<TextInputModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('renders input field', () => {
    renderWithI18n(<TextInputModal {...defaultProps} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders submit and cancel buttons', () => {
    renderWithI18n(<TextInputModal {...defaultProps} />)

    expect(screen.getByText('Submit')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn()
    renderWithI18n(<TextInputModal {...defaultProps} onCancel={onCancel} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit with input value when submit button is clicked', async () => {
    const onSubmit = jest.fn()
    renderWithI18n(<TextInputModal {...defaultProps} onSubmit={onSubmit} />)

    const input = screen.getByRole('textbox')
    const submitButton = screen.getByText('Submit')

    fireEvent.change(input, { target: { value: 'test input' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('test input')
    })
  })

  it('calls onCancel when modal cancel is clicked', () => {
    const onCancel = jest.fn()
    renderWithI18n(<TextInputModal {...defaultProps} onCancel={onCancel} />)

    const modalCancel = screen.getByTestId('modal-cancel')
    fireEvent.click(modalCancel)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('handles Enter key press', async () => {
    const onSubmit = jest.fn()
    renderWithI18n(<TextInputModal {...defaultProps} onSubmit={onSubmit} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'test input' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('test input')
    })
  })

  it('handles Escape key press', () => {
    const onCancel = jest.fn()
    renderWithI18n(<TextInputModal {...defaultProps} onCancel={onCancel} />)

    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables submit button when input is empty', () => {
    renderWithI18n(<TextInputModal {...defaultProps} />)

    const submitButton = screen.getByText('Submit')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when input has value', () => {
    renderWithI18n(<TextInputModal {...defaultProps} />)

    const input = screen.getByRole('textbox')
    const submitButton = screen.getByText('Submit')

    fireEvent.change(input, { target: { value: 'test' } })

    expect(submitButton).not.toBeDisabled()
  })

  it('shows validation error when provided', () => {
    const validationError = 'Invalid input'
    renderWithI18n(<TextInputModal {...defaultProps} validationError={validationError} />)

    expect(screen.getByText(validationError)).toBeInTheDocument()
  })

  it('handles different languages', async () => {
    await i18n.changeLanguage('es')
    renderWithI18n(<TextInputModal {...defaultProps} />)

    // The component should still render without errors
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('clears input when modal is closed and reopened', () => {
    const { rerender } = renderWithI18n(<TextInputModal {...defaultProps} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test input' } })

    // Close modal
    rerender(<TextInputModal {...defaultProps} isOpen={false} />)

    // Reopen modal
    rerender(<TextInputModal {...defaultProps} isOpen={true} />)

    const newInput = screen.getByRole('textbox')
    expect(newInput).toHaveValue('')
  })
})
