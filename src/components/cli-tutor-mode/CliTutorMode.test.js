import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import { CliTutorialModal } from './CliTutorMode.js'

// Mock dependencies
jest.mock('../modal/modal', () => ({
  Modal: ({ children, onCancel, className, style }) => (
    <div data-testid="modal" className={className} style={style}>
      <button data-testid="modal-cancel" onClick={onCancel}>Cancel</button>
      {children}
    </div>
  ),
  ModalBody: ({ children, Icon }) => (
    <div data-testid="modal-body">
      {Icon && <div data-testid="modal-icon">Icon</div>}
      {children}
    </div>
  ),
  ModalActions: ({ children }) => (
    <div data-testid="modal-actions">{children}</div>
  )
}))

jest.mock('../../icons/StrokeCode.js', () => {
  return function MockStrokeCode () {
    return <div data-testid="stroke-code-icon">StrokeCode</div>
  }
})

jest.mock('../button/button.tsx', () => {
  return function MockButton ({ children, onClick, className, ...props }) {
    return (
      <button
        onClick={onClick}
        className={className}
        data-testid="button"
        {...props}
      >
        {children}
      </button>
    )
  }
})

jest.mock('../overlay/overlay', () => {
  return function MockOverlay ({ children }) {
    return <div data-testid="overlay">{children}</div>
  }
})

jest.mock('../shell/Shell.js', () => {
  return function MockShell ({ children }) {
    return <div data-testid="shell">{children}</div>
  }
})

jest.mock('../../icons/StrokeDownload.js', () => {
  return function MockStrokeDownload () {
    return <div data-testid="stroke-download-icon">StrokeDownload</div>
  }
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
})

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  )
}

describe('CliTutorialModal', () => {
  const defaultProps = {
    command: 'ipfs add file.txt',
    t: i18n.t,
    onLeave: jest.fn(),
    className: 'test-class'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    i18n.changeLanguage('en')
  })

  it('renders without crashing', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} />)

    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('renders with correct className and style', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} />)

    const modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('test-class')
    expect(modal).toHaveStyle('max-width: 40em')
  })

  it('renders the modal icon', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} />)

    expect(screen.getByTestId('modal-icon')).toBeInTheDocument()
  })

  it('renders the command in shell component', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} />)

    expect(screen.getByTestId('shell')).toBeInTheDocument()
    expect(screen.getByText('ipfs add file.txt')).toBeInTheDocument()
  })

  it('renders copy and download buttons', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} />)

    const buttons = screen.getAllByTestId('button')
    expect(buttons).toHaveLength(2)

    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument()
    expect(screen.getByText('Download config')).toBeInTheDocument()
  })

  it('calls onLeave when cancel button is clicked', () => {
    const onLeave = jest.fn()
    renderWithI18n(<CliTutorialModal {...defaultProps} onLeave={onLeave} />)

    const cancelButton = screen.getByTestId('modal-cancel')
    fireEvent.click(cancelButton)

    expect(onLeave).toHaveBeenCalledTimes(1)
  })

  it('copies command to clipboard and calls onLeave when copy button is clicked', async () => {
    const onLeave = jest.fn()
    renderWithI18n(<CliTutorialModal {...defaultProps} onLeave={onLeave} />)

    const copyButton = screen.getByText('Copy to clipboard')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ipfs add file.txt')
      expect(onLeave).toHaveBeenCalledTimes(1)
    })
  })

  it('handles clipboard write error gracefully', async () => {
    const onLeave = jest.fn()
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'))

    renderWithI18n(<CliTutorialModal {...defaultProps} onLeave={onLeave} />)

    const copyButton = screen.getByText('Copy to clipboard')
    fireEvent.click(copyButton)

    // Should not call onLeave on error
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ipfs add file.txt')
    })

    expect(onLeave).not.toHaveBeenCalled()
  })

  it('renders download config button when downloadConfig is provided', () => {
    const downloadConfig = jest.fn()
    renderWithI18n(<CliTutorialModal {...defaultProps} downloadConfig={downloadConfig} />)

    const downloadButton = screen.getByText('Download config')
    expect(downloadButton).toBeInTheDocument()
  })

  it('calls downloadConfig when download button is clicked', () => {
    const downloadConfig = jest.fn()
    renderWithI18n(<CliTutorialModal {...defaultProps} downloadConfig={downloadConfig} />)

    const downloadButton = screen.getByText('Download config')
    fireEvent.click(downloadButton)

    expect(downloadConfig).toHaveBeenCalledTimes(1)
  })

  it('handles different languages', async () => {
    await i18n.changeLanguage('es')
    renderWithI18n(<CliTutorialModal {...defaultProps} />)

    // The component should still render without errors
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('renders without command', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} command={null} />)

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('shell')).toBeInTheDocument()
  })

  it('renders with empty command', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} command="" />)

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('shell')).toBeInTheDocument()
  })

  it('passes through additional props to modal', () => {
    renderWithI18n(<CliTutorialModal {...defaultProps} data-testid="custom-modal" />)

    const modal = screen.getByTestId('modal')
    expect(modal).toBeInTheDocument()
  })
})
