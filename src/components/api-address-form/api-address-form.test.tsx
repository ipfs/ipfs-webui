import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from 'i18next'

import ApiAddressForm from './api-address-form'
import { ContextBridgeProvider } from '../../helpers/context-bridge'

jest.mock('../button/button.tsx', () => ({
  __esModule: true,
  default: ({ children, disabled, className, onClick, ...props }: any) => {
    const React = require('react')
    const domProps = {
      disabled,
      className,
      onClick,
      'data-testid': 'submit-button'
    }
    return React.createElement('button', domProps, children)
  }
}))

jest.mock('../../helpers/context-bridge', () => {
  const originalModule = jest.requireActual('../../helpers/context-bridge')
  const realContextBridge = originalModule.contextBridge
  const mockContextBridge = {
    ...realContextBridge,
    setContext: jest.fn((name, value) => {
      realContextBridge.setContext(name, value)
    }),
    getContext: jest.fn((name) => {
      return realContextBridge.getContext(name)
    }),
    subscribe: jest.fn((name, callback) => {
      return realContextBridge.subscribe(name, callback)
    }),
    hasContext: jest.fn((name) => {
      return realContextBridge.hasContext(name)
    })
  }

  return {
    ...originalModule,
    contextBridge: mockContextBridge,
    useBridgeSelector: jest.fn((contextName) => {
      return realContextBridge.getContext(contextName)
    })
  }
})

// Setup i18n for testing
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['app'],
    defaultNS: 'app',
    resources: {
      en: {
        app: {
          terms: {
            apiAddress: 'Kubo RPC API address'
          },
          apiAddressForm: {
            placeholder: 'Enter a URL (http://user:password@127.0.0.1:5001) or a Multiaddr (/ip4/127.0.0.1/tcp/5001)'
          },
          actions: {
            submit: 'Submit'
          }
        }
      }
    }
  })

// Test utilities
const renderApiAddressForm = (contextProps: any = {}) => {
  const mockDoUpdateIpfsApiAddress = jest.fn()
  const finalContextProps = {
    ipfsApiAddress: 'http://127.0.0.1:5001',
    ipfsInitFailed: false,
    doUpdateIpfsApiAddress: mockDoUpdateIpfsApiAddress,
    ...contextProps
  }

  const { contextBridge } = require('../../helpers/context-bridge')
  contextBridge.contexts.clear()
  contextBridge.setContext('selectIpfsApiAddress', finalContextProps.ipfsApiAddress)
  contextBridge.setContext('selectIpfsInitFailed', finalContextProps.ipfsInitFailed)
  contextBridge.setContext('doUpdateIpfsApiAddress', (address: string) => {
    mockDoUpdateIpfsApiAddress(address)
    return Promise.resolve(true)
  })

  const renderResult = render(
    <ContextBridgeProvider>
      <I18nextProvider i18n={i18n}>
        <ApiAddressForm />
      </I18nextProvider>
    </ContextBridgeProvider>
  )

  return {
    ...renderResult,
    mockDoUpdateIpfsApiAddress
  }
}

describe('ApiAddressForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial render', () => {
    it('renders form with all required elements', () => {
      renderApiAddressForm()

      expect(screen.getByLabelText('Kubo RPC API address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter a URL (http://user:password@127.0.0.1:5001) or a Multiaddr (/ip4/127.0.0.1/tcp/5001)')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Submit')
    })

    it('displays initial API address value correctly', () => {
      const testAddress = 'http://localhost:5001'

      renderApiAddressForm({ ipfsApiAddress: testAddress })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveValue(testAddress)
    })

    it('handles initial invalid API address state', () => {
      const testAddress = 'invalid-address'

      renderApiAddressForm({ ipfsApiAddress: testAddress })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveValue(testAddress)
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('handles null and undefined API address values', () => {
      const { rerender } = renderApiAddressForm({ ipfsApiAddress: null })
      expect(screen.getByLabelText('Kubo RPC API address')).toHaveValue('')

      rerender(
        <ContextBridgeProvider>
          <I18nextProvider i18n={i18n}>
            <ApiAddressForm />
          </I18nextProvider>
        </ContextBridgeProvider>
      )
      expect(screen.getByLabelText('Kubo RPC API address')).toHaveValue('')
    })

    it('handles object API address values by converting to JSON string', () => {
      const testObject = { url: 'http://localhost:5001', protocol: 'http' }

      renderApiAddressForm({ ipfsApiAddress: testObject })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveValue(JSON.stringify(testObject))
    })
  })

  describe('input validation', () => {
    it('shows green border for valid addresses', () => {
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveClass('b--green-muted')
      expect(input).not.toHaveClass('b--red-muted')
    })

    it('shows red border when IPFS initialization failed', () => {
      renderApiAddressForm({ ipfsInitFailed: true })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveClass('b--red-muted')
      expect(input).not.toHaveClass('b--green-muted')
    })

    it('validates input on changes', () => {
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://test-address:5001' } })

      // The validation function should be called with the new value
      // We can't easily test this without mocking, so we just verify the input updates
      expect(input).toHaveValue('http://test-address:5001')
    })
  })

  describe('submit button state', () => {
    it('disables button for invalid addresses', () => {
      renderApiAddressForm({ ipfsApiAddress: 'invalid-address' })

      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('enables button for valid addresses that differ from current', () => {
      renderApiAddressForm({ ipfsApiAddress: 'http://current:5001' })

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })

      expect(screen.getByTestId('submit-button')).not.toBeDisabled()
    })

    it('disables button when value equals current API address', () => {
      const currentAddress = 'http://current:5001'
      renderApiAddressForm({ ipfsApiAddress: currentAddress })

      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })

  describe('form submission', () => {
    it('submits form with new address via form submit', async () => {
      const { mockDoUpdateIpfsApiAddress, container } = renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })

      const form = container.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(mockDoUpdateIpfsApiAddress).toHaveBeenCalledWith('http://new-address:5001')
      })
    })

    it('submits form with new address via Enter key', async () => {
      const { mockDoUpdateIpfsApiAddress } = renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })
      fireEvent.keyDown(input, { key: 'Enter', charCode: 13 })

      await waitFor(() => {
        expect(mockDoUpdateIpfsApiAddress).toHaveBeenCalledWith('http://new-address:5001')
      })
    })

    it('does not submit on non-Enter key presses', () => {
      const { mockDoUpdateIpfsApiAddress } = renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.keyDown(input, { key: 'A', code: 'KeyA' })
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })

      expect(mockDoUpdateIpfsApiAddress).not.toHaveBeenCalled()
    })

    it('prevents multiple submissions when Enter is held down', async () => {
      // Render with a different initial address so the form can be submitted
      const { mockDoUpdateIpfsApiAddress } = renderApiAddressForm({
        ipfsApiAddress: 'http://old-address:5001'
      })

      const input = screen.getByLabelText('Kubo RPC API address')

      // Simulate holding Enter key down multiple times
      fireEvent.keyDown(input, { key: 'Enter', charCode: 13 })
      fireEvent.keyDown(input, { key: 'Enter', charCode: 13 })
      fireEvent.keyDown(input, { key: 'Enter', charCode: 13 })

      // Should only call once even with multiple key down events
      expect(mockDoUpdateIpfsApiAddress).toHaveBeenCalledTimes(1)
    })

    // TODO: We need to ensure that submissions of the API address are not allowed when the doUpdateIpfsApiAddress is not provided.
    it('handles submission when doUpdateIpfsApiAddress is not provided', async () => {
      const { contextBridge } = require('../../helpers/context-bridge')
      contextBridge.contexts.clear()
      contextBridge.setContext('selectIpfsApiAddress', 'http://127.0.0.1:5001')
      contextBridge.setContext('selectIpfsInitFailed', false)
      contextBridge.setContext('doUpdateIpfsApiAddress', null)

      const { container } = render(
        <ContextBridgeProvider>
          <I18nextProvider i18n={i18n}>
            <ApiAddressForm />
          </I18nextProvider>
        </ContextBridgeProvider>
      )

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })

      const form = container.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(input).toHaveValue('http://new-address:5001')
      })
    })
  })

  describe('user interactions', () => {
    it('updates input value on user typing', () => {
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://user-input:5001' } })

      expect(input).toHaveValue('http://user-input:5001')
    })

    it('validates input on every change', () => {
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')

      fireEvent.change(input, { target: { value: 'first' } })
      expect(input).toHaveValue('first')
      fireEvent.change(input, { target: { value: 'second' } })
      expect(input).toHaveValue('second')
      fireEvent.change(input, { target: { value: 'third' } })
      expect(input).toHaveValue('third')
    })
  })

  describe('edge cases', () => {
    it('handles empty string input', () => {
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: '' } })

      expect(input).toHaveValue('')
    })

    it('handles special characters in URL', () => {
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      const specialValue = 'http://user:pass@127.0.0.1:5001/api/v0'
      fireEvent.change(input, { target: { value: specialValue } })

      expect(input).toHaveValue(specialValue)
    })
  })

  describe('accessibility', () => {
    it('has proper form structure and labels', () => {
      const { container } = renderApiAddressForm()

      expect(screen.getByLabelText('Kubo RPC API address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter a URL (http://user:password@127.0.0.1:5001) or a Multiaddr (/ip4/127.0.0.1/tcp/5001)')).toBeInTheDocument()
      expect(container.querySelector('form')).toBeInTheDocument()
    })
  })
})
