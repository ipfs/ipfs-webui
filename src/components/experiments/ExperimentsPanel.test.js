import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import ExperimentsPanel from './ExperimentsPanel.js'

// Mock dependencies
jest.mock('../checkbox/Checkbox.js', () => {
  return function MockCheckbox ({ checked, onChange, disabled, label }) {
    return (
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          data-testid="checkbox"
        />
        {label}
      </label>
    )
  }
})

jest.mock('../box/Box.js', () => {
  return function MockBox ({ children, className }) {
    return <div className={className} data-testid="box">{children}</div>
  }
})

jest.mock('../../settings/Title.js', () => {
  return function MockTitle ({ children }) {
    return <h2 data-testid="title">{children}</h2>
  }
})

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  )
}

describe('ExperimentsPanel', () => {
  const mockExperiments = [
    {
      key: 'test-experiment-1',
      enabled: true,
      blocked: false,
      actionUrls: [
        { key: 'action1', url: 'https://example.com/action1' },
        { key: 'action2', url: 'https://example.com/action2' }
      ]
    },
    {
      key: 'test-experiment-2',
      enabled: false,
      blocked: true,
      actionUrls: null
    },
    {
      key: 'test-experiment-3',
      enabled: false,
      blocked: false,
      actionUrls: []
    }
  ]

  const defaultProps = {
    doExpToggleAction: jest.fn(),
    experiments: mockExperiments,
    t: i18n.t
  }

  beforeEach(() => {
    jest.clearAllMocks()
    i18n.changeLanguage('en')
  })

  it('renders when experiments are provided', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    expect(screen.getByTestId('box')).toBeInTheDocument()
    expect(screen.getByTestId('title')).toBeInTheDocument()
  })

  it('does not render when no experiments are provided', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} experiments={[]} />)

    expect(screen.queryByTestId('box')).not.toBeInTheDocument()
  })

  it('does not render when experiments is null', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} experiments={null} />)

    expect(screen.queryByTestId('box')).not.toBeInTheDocument()
  })

  it('renders all experiments', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    const checkboxes = screen.getAllByTestId('checkbox')
    expect(checkboxes).toHaveLength(3)
  })

  it('renders experiment titles', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    // Should render experiment titles (mocked as experiment keys)
    expect(screen.getByText('test-experiment-1')).toBeInTheDocument()
    expect(screen.getByText('test-experiment-2')).toBeInTheDocument()
    expect(screen.getByText('test-experiment-3')).toBeInTheDocument()
  })

  it('renders checkboxes with correct states', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    const checkboxes = screen.getAllByTestId('checkbox')

    // First experiment is enabled
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[0]).not.toBeDisabled()

    // Second experiment is disabled and blocked
    expect(checkboxes[1]).not.toBeChecked()
    expect(checkboxes[1]).toBeDisabled()

    // Third experiment is disabled but not blocked
    expect(checkboxes[2]).not.toBeChecked()
    expect(checkboxes[2]).not.toBeDisabled()
  })

  it('calls doExpToggleAction when checkbox is clicked', () => {
    const doExpToggleAction = jest.fn()
    renderWithI18n(<ExperimentsPanel {...defaultProps} doExpToggleAction={doExpToggleAction} />)

    const checkboxes = screen.getAllByTestId('checkbox')

    // Click the first checkbox
    fireEvent.click(checkboxes[0])

    expect(doExpToggleAction).toHaveBeenCalledWith('test-experiment-1', true)
  })

  it('renders action URLs when provided', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    // Should render action URLs for the first experiment
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)

    expect(links[0]).toHaveAttribute('href', 'https://example.com/action1')
    expect(links[1]).toHaveAttribute('href', 'https://example.com/action2')
  })

  it('does not render action URLs when not provided', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    // Should not render action URLs for experiments without them
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2) // Only from first experiment
  })

  it('renders action URLs with proper attributes', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    const links = screen.getAllByRole('link')

    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('handles different languages', async () => {
    await i18n.changeLanguage('es')
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    // The component should still render without errors
    expect(screen.getByTestId('box')).toBeInTheDocument()
  })

  it('renders with proper CSS classes', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} />)

    const box = screen.getByTestId('box')
    expect(box).toHaveClass('mb3', 'pa4', 'lh-copy')
  })

  it('handles empty experiments array', () => {
    renderWithI18n(<ExperimentsPanel {...defaultProps} experiments={[]} />)

    expect(screen.queryByTestId('box')).not.toBeInTheDocument()
  })
})
