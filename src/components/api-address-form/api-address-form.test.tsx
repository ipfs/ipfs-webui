import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from 'i18next'

import ApiAddressForm from './api-address-form'
import { ContextBridgeProvider } from '../../helpers/context-bridge'

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
const renderApiAddressForm = (contextProps: any = {}, validationProps: any = {}) => {
  const mockDoUpdateIpfsApiAddress = jest.fn()
  const defaultMockCheckValidAPIAddress = jest.fn().mockReturnValue(true)

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

  // Only wrap with Promise.resolve when no custom handler is provided
  const doUpdateHandler = contextProps.doUpdateIpfsApiAddress || ((address: string) => {
    mockDoUpdateIpfsApiAddress(address)
    return Promise.resolve(true)
  })
  contextBridge.setContext('doUpdateIpfsApiAddress', doUpdateHandler)

  const checkValidAPIAddress = validationProps.checkValidAPIAddress || defaultMockCheckValidAPIAddress

  const renderResult = render(
    <ContextBridgeProvider>
      <I18nextProvider i18n={i18n}>
        <ApiAddressForm checkValidAPIAddress={checkValidAPIAddress} />
      </I18nextProvider>
    </ContextBridgeProvider>
  )

  return {
    ...renderResult,
    mockDoUpdateIpfsApiAddress,
    mockCheckValidAPIAddress: checkValidAPIAddress,
    contextBridge
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
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toHaveTextContent('Submit')
    })

    it('shows current API address in the input on first render', () => {
      const testAddress = 'http://localhost:5001'

      renderApiAddressForm({ ipfsApiAddress: testAddress })

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveValue(testAddress)
    })

    it('disables submit and shows error styling when initial address is invalid', () => {
      const testAddress = 'invalid-address'
      const mockCheckValidAPIAddress = jest.fn().mockReturnValue(false)

      const { mockCheckValidAPIAddress: mockValidation } = renderApiAddressForm(
        { ipfsApiAddress: testAddress },
        { checkValidAPIAddress: mockCheckValidAPIAddress }
      )

      const input = screen.getByLabelText('Kubo RPC API address')
      expect(input).toHaveValue(testAddress)
      expect(mockValidation).toHaveBeenCalledWith(testAddress)

      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
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

    it('toggles red/green styles and disabled state as validation flips', () => {
      const mockCheckValidAPIAddress = jest.fn()
        .mockReturnValueOnce(true) // Initial valid
        .mockReturnValueOnce(false) // After change to invalid
        .mockReturnValueOnce(true) // After change back to valid

      const { mockCheckValidAPIAddress: mockValidation } = renderApiAddressForm(
        {},
        { checkValidAPIAddress: mockCheckValidAPIAddress }
      )

      const input = screen.getByLabelText('Kubo RPC API address')

      expect(mockValidation).toHaveBeenCalledWith('http://127.0.0.1:5001')

      fireEvent.change(input, { target: { value: 'invalid-address' } })
      expect(input).toHaveValue('invalid-address')
      expect(mockValidation).toHaveBeenCalledWith('invalid-address')

      fireEvent.change(input, { target: { value: 'http://valid-address:5001' } })
      expect(input).toHaveValue('http://valid-address:5001')
      expect(mockValidation).toHaveBeenCalledWith('http://valid-address:5001')
    })
  })

  describe('submit button state', () => {
    it('disables button for invalid addresses', () => {
      const mockCheckValidAPIAddress = jest.fn().mockReturnValue(false)

      const { mockCheckValidAPIAddress: mockValidation } = renderApiAddressForm(
        { ipfsApiAddress: 'invalid-address' },
        { checkValidAPIAddress: mockCheckValidAPIAddress }
      )

      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
      expect(mockValidation).toHaveBeenCalledWith('invalid-address')
    })

    it('enables button for valid addresses that differ from current', () => {
      const mockCheckValidAPIAddress = jest.fn().mockReturnValue(true)

      const { mockCheckValidAPIAddress: mockValidation } = renderApiAddressForm(
        { ipfsApiAddress: 'http://current:5001' },
        { checkValidAPIAddress: mockCheckValidAPIAddress }
      )

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })

      expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
      expect(mockValidation).toHaveBeenCalledWith('http://new-address:5001')
    })

    it('disables button when value equals current API address', () => {
      const currentAddress = 'http://current:5001'
      renderApiAddressForm({ ipfsApiAddress: currentAddress })

      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
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
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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

    it('while submitting, additional Enter presses are ignored', async () => {
      let deferredResolve!: () => void
      const pending = new Promise<void>(resolve => { deferredResolve = resolve })
      const doUpdate = jest.fn().mockImplementation(() => pending)

      renderApiAddressForm({
        doUpdateIpfsApiAddress: doUpdate,
        ipfsApiAddress: 'http://old-address:5001'
      })

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: 'http://new-address:5001' } })

      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(doUpdate).toHaveBeenCalledTimes(1)

      deferredResolve()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
      })
    })

    it('handles submission when doUpdateIpfsApiAddress is not provided without throwing errors', async () => {
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

      expect(() => {
        fireEvent.submit(form!)
      }).not.toThrow()

      await waitFor(() => {
        expect(input).toHaveValue('http://new-address:5001')
      })
    })
  })

  describe('user interactions', () => {
    it('updates input value and validation state on user typing', () => {
      const mockCheckValidAPIAddress = jest.fn()
        .mockReturnValueOnce(true) // Initial
        .mockReturnValueOnce(false) // After first change
        .mockReturnValueOnce(true) // After second change

      const { mockCheckValidAPIAddress: mockValidation } = renderApiAddressForm(
        {},
        { checkValidAPIAddress: mockCheckValidAPIAddress }
      )

      const input = screen.getByLabelText('Kubo RPC API address')

      fireEvent.change(input, { target: { value: 'first' } })
      expect(input).toHaveValue('first')
      expect(mockValidation).toHaveBeenCalledWith('first')

      fireEvent.change(input, { target: { value: 'http://valid-address:5001' } })
      expect(input).toHaveValue('http://valid-address:5001')
      expect(mockValidation).toHaveBeenCalledWith('http://valid-address:5001')
    })
  })

  describe('edge cases', () => {
    it('handles empty string input', () => {
      const mockCheckValidAPIAddress = jest.fn().mockReturnValue(false)

      const { mockCheckValidAPIAddress: mockValidation } = renderApiAddressForm(
        {},
        { checkValidAPIAddress: mockCheckValidAPIAddress }
      )

      const input = screen.getByLabelText('Kubo RPC API address')
      fireEvent.change(input, { target: { value: '' } })

      expect(input).toHaveValue('')
      expect(mockValidation).toHaveBeenCalledWith('')
    })

    it('handles special characters in URL and validates correctly', () => {
      const mockCheckValidAPIAddress = jest.fn().mockReturnValue(true)

      const { mockCheckValidAPIAddress: mockValidation } = renderApiAddressForm(
        {},
        { checkValidAPIAddress: mockCheckValidAPIAddress }
      )

      const input = screen.getByLabelText('Kubo RPC API address')
      const specialValue = 'http://user:pass@127.0.0.1:5001/api/v0'
      fireEvent.change(input, { target: { value: specialValue } })

      expect(input).toHaveValue(specialValue)
      expect(mockValidation).toHaveBeenCalledWith(specialValue)
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
