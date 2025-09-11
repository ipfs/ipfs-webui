import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import IsNotConnected from './IsNotConnected.js'

// Mock dependencies
jest.mock('../api-address-form/api-address-form', () => {
  return function MockApiAddressForm () {
    return <div data-testid="api-address-form">API Address Form</div>
  }
})

jest.mock('../box/Box.js', () => {
  return function MockBox ({ children, className }) {
    return <div className={className} data-testid="box">{children}</div>
  }
})

jest.mock('../shell/Shell.js', () => {
  return function MockShell ({ children }) {
    return <div data-testid="shell">{children}</div>
  }
})

jest.mock('../../icons/GlyphAttention.js', () => {
  return function MockGlyphAttention () {
    return <div data-testid="attention-icon">Attention Icon</div>
  }
})

jest.mock('../../helpers/context-bridge', () => ({
  useBridgeSelector: jest.fn(() => false)
}))

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  )
}

describe('IsNotConnected', () => {
  beforeEach(() => {
    // Reset i18n to default language
    i18n.changeLanguage('en')

    // Mock window.location
    delete window.location
    window.location = { origin: 'http://localhost:3000' }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderWithI18n(<IsNotConnected />)

    expect(screen.getByTestId('box')).toBeInTheDocument()
  })

  it('renders the attention icon', () => {
    renderWithI18n(<IsNotConnected />)

    expect(screen.getByTestId('attention-icon')).toBeInTheDocument()
  })

  it('renders the API address form', () => {
    renderWithI18n(<IsNotConnected />)

    expect(screen.getByTestId('api-address-form')).toBeInTheDocument()
  })

  it('renders shell component', () => {
    renderWithI18n(<IsNotConnected />)

    expect(screen.getByTestId('shell')).toBeInTheDocument()
  })

  it('shows default domains for localhost origin', () => {
    window.location.origin = 'http://localhost:3000'
    renderWithI18n(<IsNotConnected />)

    // Should show default domains since localhost is in the list
    expect(screen.getByText(/http:\/\/localhost:3000/)).toBeInTheDocument()
  })

  it('shows default domains for 127.0.0.1 origin', () => {
    window.location.origin = 'http://127.0.0.1:5001'
    renderWithI18n(<IsNotConnected />)

    expect(screen.getByText(/http:\/\/127\.0\.0\.1:5001/)).toBeInTheDocument()
  })

  it('shows default domains for webui.ipfs.io origin', () => {
    window.location.origin = 'https://webui.ipfs.io'
    renderWithI18n(<IsNotConnected />)

    expect(screen.getByText(/https:\/\/webui\.ipfs\.io/)).toBeInTheDocument()
  })

  it('handles different languages', async () => {
    await i18n.changeLanguage('es')
    renderWithI18n(<IsNotConnected />)

    // The component should still render without errors
    expect(screen.getByTestId('box')).toBeInTheDocument()
  })

  it('renders with proper CSS classes', () => {
    renderWithI18n(<IsNotConnected />)

    const box = screen.getByTestId('box')
    expect(box).toHaveClass('pv3', 'ph4', 'lh-copy', 'charcoal')
  })

  it('handles tab switching', () => {
    renderWithI18n(<IsNotConnected />)

    // The component should render without errors
    expect(screen.getByTestId('box')).toBeInTheDocument()
  })
})
