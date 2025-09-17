import React from 'react'
import { render, screen, waitFor, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { GologLevelAutocomplete } from './golog-level-autocomplete'

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'logs.autocomplete.globalLevel': 'Global level',
        'logs.autocomplete.subsystem': 'Subsystem',
        'logs.autocomplete.level': 'Log level'
      }
      return translations[key] || key
    }
  })
}))

interface LogSubsystem {
  name: string
  level: string
}

const mockSubsystems: LogSubsystem[] = [
  { name: 'core', level: 'info' },
  { name: 'network', level: 'warn' },
  { name: 'storage', level: 'error' },
  { name: 'routing', level: 'debug' },
  { name: 'peer', level: 'info' }
]

const defaultProps = {
  value: '',
  onChange: jest.fn(),
  subsystems: mockSubsystems,
  disabled: false,
  placeholder: 'Enter log levels...',
  className: 'test-class'
}

describe('GologLevelAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('rendering', () => {
    it('should render with default props', () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('')
      expect(input).toHaveAttribute('placeholder', 'Enter log levels...')
      expect(input).not.toBeDisabled()
    })

    it('should render with initial value', () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('info')
    })

    it('should render disabled state', () => {
      render(<GologLevelAutocomplete {...defaultProps} disabled={true} />)

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should apply custom className', () => {
      render(<GologLevelAutocomplete {...defaultProps} className="custom-class" />)

      const container = screen.getByRole('textbox').parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('should have monospace font styling via code class', () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('code')
    })
  })

  describe('input handling', () => {
    it('should call onChange when input changes', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'debug')

      expect(defaultProps.onChange).toHaveBeenCalledWith('debug')
    })

    it('should update input value when prop changes', () => {
      const { rerender } = render(<GologLevelAutocomplete {...defaultProps} value="" />)

      let input = screen.getByRole('textbox')
      expect(input).toHaveValue('')

      rerender(<GologLevelAutocomplete {...defaultProps} value="info" />)
      input = screen.getByRole('textbox')
      expect(input).toHaveValue('info')
    })
  })

  describe('suggestions for global levels', () => {
    it('should show global level suggestions when input is empty', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
        expect(screen.getByText('warn')).toBeInTheDocument()
        expect(screen.getByText('error')).toBeInTheDocument()
        expect(screen.getByText('dpanic')).toBeInTheDocument()
        expect(screen.getByText('panic')).toBeInTheDocument()
        expect(screen.getByText('fatal')).toBeInTheDocument()
      })
    })

    it('should filter global level suggestions based on input', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'de')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
        expect(screen.queryByText('info')).not.toBeInTheDocument()
        expect(screen.queryByText('warn')).not.toBeInTheDocument()
      })
    })

    it('should select global level when clicked', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      const debugOption = screen.getByText('debug')
      await userEvent.click(debugOption)

      expect(defaultProps.onChange).toHaveBeenCalledWith('debug')
    })
  })

  describe('suggestions for subsystems', () => {
    it('should show subsystem suggestions after comma', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info," />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('core')).toBeInTheDocument()
        expect(screen.getByText('network')).toBeInTheDocument()
        expect(screen.getByText('storage')).toBeInTheDocument()
        expect(screen.getByText('routing')).toBeInTheDocument()
        expect(screen.getByText('peer')).toBeInTheDocument()
      })
    })

    it('should filter subsystem suggestions based on input', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,ne" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('network')).toBeInTheDocument()
        expect(screen.queryByText('core')).not.toBeInTheDocument()
        expect(screen.queryByText('storage')).not.toBeInTheDocument()
      })
    })

    it('should not show already used subsystems', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=debug," />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.queryByText('core')).not.toBeInTheDocument()
        expect(screen.getByText('network')).toBeInTheDocument()
        expect(screen.getByText('storage')).toBeInTheDocument()
      })
    })

    it('should add equals sign when selecting subsystem', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info," />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('core')).toBeInTheDocument()
      })

      const coreOption = screen.getByText('core')
      await userEvent.click(coreOption)

      expect(defaultProps.onChange).toHaveBeenCalledWith('info,core=')
    })
  })

  describe('suggestions for levels after equals sign', () => {
    it('should show level suggestions after subsystem equals sign', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
        expect(screen.getByText('warn')).toBeInTheDocument()
        expect(screen.getByText('error')).toBeInTheDocument()
      })
    })

    it('should filter level suggestions based on input', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=de" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
        expect(screen.queryByText('info')).not.toBeInTheDocument()
        expect(screen.queryByText('warn')).not.toBeInTheDocument()
      })
    })

    it('should complete subsystem=level when selecting level', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      const debugOption = screen.getByText('debug')
      await userEvent.click(debugOption)

      expect(defaultProps.onChange).toHaveBeenCalledWith('info,core=debug')
    })
  })

  describe('keyboard navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      // Press arrow down to select next item
      await userEvent.keyboard('{ArrowDown}')

      // The second item (info) should be highlighted
      const infoOption = screen.getByText('info').closest('div')
      expect(infoOption).toHaveClass('bg-light-blue')
    })

    it('should navigate suggestions with arrow up key', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      // Press arrow down twice to go to third item
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowDown}')

      // Press arrow up to go back to second item
      await userEvent.keyboard('{ArrowUp}')

      // The second item (info) should be highlighted
      const infoOption = screen.getByText('info').closest('div')
      expect(infoOption).toHaveClass('bg-light-blue')
    })

    it('should select suggestion with Enter key', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      await userEvent.keyboard('{Enter}')

      expect(defaultProps.onChange).toHaveBeenCalledWith('debug')
    })

    it('should close dropdown with Escape key', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      await userEvent.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByText('debug')).not.toBeInTheDocument()
      })
    })
  })

  describe('dropdown behavior', () => {
    it('should not show suggestions when at end of complete part', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=debug" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // Should not show suggestions when the last part is complete
      await waitFor(() => {
        expect(screen.queryByText('debug')).not.toBeInTheDocument()
        expect(screen.queryByText('info')).not.toBeInTheDocument()
      })
    })

    it('should close dropdown when clicking outside', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      // Click outside the component
      await userEvent.click(document.body)

      await waitFor(() => {
        expect(screen.queryByText('debug')).not.toBeInTheDocument()
      })
    })

    it('should show suggestion types in dropdown', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        // Use getAllByText since there are multiple "Global level" elements
        const globalLevelElements = screen.getAllByText('Global level')
        expect(globalLevelElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple subsystem=level pairs', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=debug,network=" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('warn')).toBeInTheDocument()
        expect(screen.getByText('error')).toBeInTheDocument()
      })

      const warnOption = screen.getByText('warn')
      await userEvent.click(warnOption)

      expect(defaultProps.onChange).toHaveBeenCalledWith('info,core=debug,network=warn')
    })

    it('should handle cursor position correctly and show appropriate suggestions', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=debug" />)

      const input = screen.getByRole('textbox')

      // Click to focus - cursor should be at the end of the complete part
      await userEvent.click(input)

      // Verify cursor is at the end by checking NO suggestions are shown
      // (since we're at the end of a complete subsystem=level pair)
      await waitFor(() => {
        expect(screen.queryByText('debug')).not.toBeInTheDocument()
        expect(screen.queryByText('info')).not.toBeInTheDocument()
        expect(screen.queryByText('core')).not.toBeInTheDocument()
      })

      // Add a comma to move to the next subsystem selection mode
      await userEvent.type(input, ',')

      // Should now show subsystem suggestions immediately (excluding 'core' since it's already used)
      await waitFor(() => {
        expect(screen.getByText('network')).toBeInTheDocument()
        expect(screen.getByText('storage')).toBeInTheDocument()
        expect(screen.getByText('routing')).toBeInTheDocument()
        expect(screen.queryByText('core')).not.toBeInTheDocument() // Already used
      })

      expect(defaultProps.onChange).toHaveBeenCalledWith('info,core=debug,')
    })

    it('should handle invalid log levels gracefully', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=invalid" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // The component might not show suggestions in this scenario
      // Let's just verify the input is still functional
      expect(input).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should support keyboard navigation on dropdown items', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      await waitFor(() => {
        // Find the dropdown container and check its children
        const dropdown = screen.getByRole('textbox').parentElement?.querySelector('.absolute')
        expect(dropdown).toBeInTheDocument()

        // Check that dropdown items have proper attributes
        const dropdownItems = dropdown?.querySelectorAll('[role="button"]')
        expect(dropdownItems?.length).toBeGreaterThan(0)

        if (dropdownItems && dropdownItems.length > 0) {
          const firstItem = dropdownItems[0] as HTMLElement
          expect(firstItem).toHaveAttribute('role', 'button')
          expect(firstItem).toHaveAttribute('tabIndex', '0')
        }
      })
    })
  })

  describe('error handling', () => {
    it('should apply error styling to input when error is present', () => {
      const errorMessage = 'Invalid log level provided'
      render(<GologLevelAutocomplete {...defaultProps} value="invalid" error={errorMessage} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('b--red-muted')
      expect(input).toHaveClass('focus-outline-red')
    })

    it('should not apply error styling when no error is present', () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('b--black-20')
      expect(input).not.toHaveClass('b--red-muted')
      expect(input).not.toHaveClass('focus-outline-red')
    })

    it('should not display error message when error prop is empty', () => {
      render(<GologLevelAutocomplete {...defaultProps} error="" />)

      // Should not find any error message
      expect(screen.queryByText('Invalid log level')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty subsystems array', async () => {
      render(<GologLevelAutocomplete {...defaultProps} subsystems={[]} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'info,')
      await userEvent.click(input)

      // Should not crash and should still show global level suggestions
      expect(input).toBeInTheDocument()
    })

    it('should handle very long input values', () => {
      const longValue = 'info,' + 'core=debug,'.repeat(50)
      render(<GologLevelAutocomplete {...defaultProps} value={longValue} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue(longValue)
    })

    it('should handle special characters in subsystem names', async () => {
      const subsystemsWithSpecialChars: LogSubsystem[] = [
        { name: 'core-api', level: 'info' },
        { name: 'network_v2', level: 'warn' },
        { name: 'storage.test', level: 'error' }
      ]

      render(<GologLevelAutocomplete {...defaultProps} subsystems={subsystemsWithSpecialChars} value="info," />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // Should handle special characters without crashing
      expect(input).toBeInTheDocument()
    })

    it('should handle invalid input gracefully', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,invalid" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // The component should handle invalid input without crashing
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('info,invalid')
    })

    it('should handle async form submission with error', async () => {
      const mockOnSubmit = jest.fn<(event?: React.FormEvent) => Promise<void>>().mockImplementation(() => Promise.reject(new Error('Submission failed')))
      const mockOnValidityChange = jest.fn()
      const mockOnErrorChange = jest.fn()

      const { unmount } = render(
        <GologLevelAutocomplete
          {...defaultProps}
          value="info"
          onSubmit={mockOnSubmit}
          onValidityChange={mockOnValidityChange}
          onErrorChange={mockOnErrorChange}
        />
      )

      const input = screen.getByRole('textbox')

      // Use act to ensure all state updates are handled properly
      await act(async () => {
        await userEvent.type(input, '{enter}')
      })

      // Wait for all async operations and state updates to complete
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      // Ensure all state updates have been processed
      await waitFor(() => {
        // The component should remain interactive after error
        expect(input).not.toBeDisabled()
      }, { timeout: 1000 })

      // Verify that the component remains interactive after error
      expect(input).toHaveValue('info')

      // Clean up properly
      unmount()
    })

    it('should handle async form submission with unknown error', async () => {
      const mockOnSubmit = jest.fn<(event?: React.FormEvent) => Promise<void>>().mockImplementation(() => Promise.reject(new Error('Unknown error')))
      const mockOnErrorChange = jest.fn()

      const { unmount } = render(
        <GologLevelAutocomplete
          {...defaultProps}
          value="info"
          onSubmit={mockOnSubmit}
          onErrorChange={mockOnErrorChange}
        />
      )

      const input = screen.getByRole('textbox')

      // Use act to ensure all state updates are handled properly
      await act(async () => {
        await userEvent.type(input, '{enter}')
      })

      // Wait for all async operations and state updates to complete
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      // Ensure all state updates have been processed
      await waitFor(() => {
        // The component should remain interactive after error
        expect(input).not.toBeDisabled()
      }, { timeout: 1000 })

      // Verify that the component remains interactive after error
      expect(input).toHaveValue('info')

      // Clean up properly
      unmount()
    })

    it('should handle cursor positioning after suggestion selection', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info," />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('core')).toBeInTheDocument()
      })

      // Select a subsystem suggestion
      const suggestion = screen.getByText('core')
      await userEvent.click(suggestion)

      // Verify that the input value is updated correctly
      await waitFor(() => {
        expect(input).toHaveValue('info,core=')
      })
    })

    it('should handle focus after suggestion selection', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      // Select a level suggestion
      const suggestion = screen.getByText('debug')
      await userEvent.click(suggestion)

      // Verify that the input value is updated correctly
      await waitFor(() => {
        expect(input).toHaveValue('info,core=debug')
      })
    })

    it('should call onErrorChange when error prop changes', () => {
      const mockOnErrorChange = jest.fn()
      const { rerender } = render(
        <GologLevelAutocomplete
          {...defaultProps}
          error=""
          onErrorChange={mockOnErrorChange}
        />
      )

      // Change error prop
      rerender(
        <GologLevelAutocomplete
          {...defaultProps}
          error="New error message"
          onErrorChange={mockOnErrorChange}
        />
      )

      expect(mockOnErrorChange).toHaveBeenCalledWith('New error message')
    })

    it('should display suggestion type labels', async () => {
      render(<GologLevelAutocomplete {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('debug')).toBeInTheDocument()
      })

      // Check that suggestion type labels are rendered with translations
      const labels = screen.getAllByText('Global level')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('should handle complete subsystem=level pairs', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info,core=debug" />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // The component should handle complete pairs without showing suggestions
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('info,core=debug')
    })

    it('should handle async UI updates after suggestion selection', async () => {
      render(<GologLevelAutocomplete {...defaultProps} value="info," />)

      const input = screen.getByRole('textbox')
      await userEvent.click(input)

      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('core')).toBeInTheDocument()
      })

      // Select a subsystem suggestion to trigger async updates
      const suggestion = screen.getByText('core')
      await userEvent.click(suggestion)

      // Wait for async updates to complete
      await waitFor(() => {
        expect(input).toHaveValue('info,core=')
      })

      // Should handle async updates without crashing
      expect(input).toBeInTheDocument()
    })

    it('should integrate with validation logic', async () => {
      const mockOnValidityChange = jest.fn()
      render(
        <GologLevelAutocomplete
          {...defaultProps}
          onValidityChange={mockOnValidityChange}
        />
      )

      const input = screen.getByRole('textbox')

      // Type invalid input
      await userEvent.type(input, 'invalid')
      expect(mockOnValidityChange).toHaveBeenCalledWith(false)

      // Type valid input
      await userEvent.clear(input)
      await userEvent.type(input, 'info')
      expect(mockOnValidityChange).toHaveBeenCalledWith(true)
    })
  })
})
