import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import { AboutWebUI } from './AboutWebUI.js'

// Mock the Box component
jest.mock('../box/Box.js', () => {
  return function MockBox ({ children, className }) {
    return <div className={className} data-testid="box">{children}</div>
  }
})

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  )
}

describe('AboutWebUI', () => {
  beforeEach(() => {
    // Reset i18n to default language
    i18n.changeLanguage('en')
  })

  it('renders the header', () => {
    renderWithI18n(<AboutWebUI t={i18n.t} />)

    expect(screen.getByText('welcomeInfo.header')).toBeInTheDocument()
  })

  it('renders all feature list items', () => {
    renderWithI18n(<AboutWebUI t={i18n.t} />)

    // Check for key features mentioned in the component
    expect(screen.getByText(/Check your node status/)).toBeInTheDocument()
    expect(screen.getByText(/View and manage files/)).toBeInTheDocument()
    expect(screen.getByText(/Visit the "Merkle Forest"/)).toBeInTheDocument()
    expect(screen.getByText(/See who's connected to your node/)).toBeInTheDocument()
    expect(screen.getByText(/Review or edit your node settings/)).toBeInTheDocument()
  })

  it('contains links to different sections', () => {
    renderWithI18n(<AboutWebUI t={i18n.t} />)

    // Check for navigation links
    expect(screen.getByText('Check your node status')).toBeInTheDocument()
    expect(screen.getByText('View and manage files')).toBeInTheDocument()
    expect(screen.getByText('Visit the "Merkle Forest"')).toBeInTheDocument()
    expect(screen.getByText('See who\'s connected to your node')).toBeInTheDocument()
    expect(screen.getByText('Review or edit your node settings')).toBeInTheDocument()
  })

  it('renders with proper structure', () => {
    renderWithI18n(<AboutWebUI t={i18n.t} />)

    // Check for proper HTML structure
    const header = screen.getByRole('heading', { level: 2 })
    expect(header).toBeInTheDocument()

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(6) // Should have 6 list items
  })

  it('wraps content in Box component', () => {
    renderWithI18n(<AboutWebUI t={i18n.t} />)

    expect(screen.getByTestId('box')).toBeInTheDocument()
  })

  it('handles different languages', async () => {
    // Test with a different language
    await i18n.changeLanguage('es')
    renderWithI18n(<AboutWebUI t={i18n.t} />)

    // The component should still render without errors
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
