import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from 'i18next'

import ApiAddressForm from './api-address-form'
import { ContextBridgeProvider } from '../../helpers/context-bridge'

// Mock dependencies
jest.mock('../../bundles/ipfs-provider.js', () => ({
  checkValidAPIAddress: jest.fn()
}))

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

// Get reference to the mocked function to avoid jest.mock hoisting referenced jest.fn() causing errors.
const mockCheckValidAPIAddress = jest.mocked(require('../../bundles/ipfs-provider.js').checkValidAPIAddress)

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
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm()

      expect(screen.getByLabelText('Kubo RPC API address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter a URL (http://user:password@127.0.0.1:5001) or a Multiaddr (/ip4/127.0.0.1/tcp/5001)')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Submit')
    })

    it('displays initial API address value correctly', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      const testAddress = 'http://localhost:5001'

      renderApiAddressForm({ ipfsApiAddress: testAddress })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveValue(testAddress)
    })

    it('handles null and undefined API address values', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)

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
      mockCheckValidAPIAddress.mockReturnValue(true)
      const testObject = { url: 'http://localhost:5001', protocol: 'http' }

      renderApiAddressForm({ ipfsApiAddress: testObject })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveValue(JSON.stringify(testObject))
    })
  })

  describe('input validation', () => {
    it('shows green border for valid addresses', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveClass('b--green-muted')
      expect(input).not.toHaveClass('b--red-muted')
    })

    it('shows red border when IPFS initialization failed', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm({ ipfsInitFailed: true })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveClass('b--red-muted')
      expect(input).not.toHaveClass('b--green-muted')
    })

    it('calls validation function on input changes', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://test-address:5001' } })

      expect(mockCheckValidAPIAddress).toHaveBeenCalledWith('http://test-address:5001')
    })
  })

  describe('submit button state', () => {
    it('disables button for invalid addresses', () => {
      mockCheckValidAPIAddress.mockReturnValue(false)
      renderApiAddressForm()

      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('enables button for valid addresses that differ from current', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm({ ipfsApiAddress: 'http://current:5001' })

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })

      expect(screen.getByTestId('submit-button')).not.toBeDisabled()
    })

    it('disables button when value equals current API address', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      const currentAddress = 'http://current:5001'
      renderApiAddressForm({ ipfsApiAddress: currentAddress })

      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })

  describe('form submission', () => {
    it('submits form with new address via form submit', async () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
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
      mockCheckValidAPIAddress.mockReturnValue(true)
      const { mockDoUpdateIpfsApiAddress } = renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })
      fireEvent.keyPress(input, { key: 'Enter', charCode: 13 })

      await waitFor(() => {
        expect(mockDoUpdateIpfsApiAddress).toHaveBeenCalledWith('http://new-address:5001')
      })
    })

    it('does not submit on other key presses', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      const { mockDoUpdateIpfsApiAddress } = renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.keyPress(input, { key: 'A', code: 'KeyA' })

      expect(mockDoUpdateIpfsApiAddress).not.toHaveBeenCalled()
    })
  })

  describe('user interactions', () => {
    it('updates input value on user typing', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://user-input:5001' } })

      expect(input).toHaveValue('http://user-input:5001')
    })

    it('validates input on every change', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')

      fireEvent.change(input, { target: { value: 'first' } })
      fireEvent.change(input, { target: { value: 'second' } })
      fireEvent.change(input, { target: { value: 'third' } })

      expect(mockCheckValidAPIAddress).toHaveBeenCalledWith('first')
      expect(mockCheckValidAPIAddress).toHaveBeenCalledWith('second')
      expect(mockCheckValidAPIAddress).toHaveBeenCalledWith('third')
    })
  })

  describe('edge cases', () => {
    it('handles empty string input', () => {
      mockCheckValidAPIAddress.mockReturnValue(false)
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: '' } })

      expect(input).toHaveValue('')
      expect(mockCheckValidAPIAddress).toHaveBeenCalledWith('')
    })

    it('handles special characters in URL', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      renderApiAddressForm()

      const input = screen.getByLabelText('Kubo RPC API address')
      const specialValue = 'http://user:pass@127.0.0.1:5001/api/v0'
      fireEvent.change(input, { target: { value: specialValue } })

      expect(input).toHaveValue(specialValue)
      expect(mockCheckValidAPIAddress).toHaveBeenCalledWith(specialValue)
    })
  })

  describe('accessibility', () => {
    it('has proper form structure and labels', () => {
      mockCheckValidAPIAddress.mockReturnValue(true)
      const { container } = renderApiAddressForm()

      expect(screen.getByLabelText('Kubo RPC API address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter a URL (http://user:password@127.0.0.1:5001) or a Multiaddr (/ip4/127.0.0.1/tcp/5001)')).toBeInTheDocument()
      expect(container.querySelector('form')).toBeInTheDocument()
    })
  })
})
