import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import { AboutIpfs } from './AboutIpfs.js'

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

describe('AboutIpfs', () => {
  beforeEach(() => {
    // Reset i18n to default language
    i18n.changeLanguage('en')
  })

  it('renders the header', () => {
    renderWithI18n(<AboutIpfs t={i18n.t} />)

    expect(screen.getByText('About IPFS')).toBeInTheDocument()
  })

  it('renders all IPFS feature descriptions', () => {
    renderWithI18n(<AboutIpfs t={i18n.t} />)

    // Check for key IPFS features
    expect(screen.getByText(/A hypermedia distribution protocol/)).toBeInTheDocument()
    expect(screen.getByText(/A peer-to-peer file transfer network/)).toBeInTheDocument()
    expect(screen.getByText(/An on-ramp to tomorrow's web/)).toBeInTheDocument()
    expect(screen.getByText(/A next-gen CDN/)).toBeInTheDocument()
    expect(screen.getByText(/A developer toolset/)).toBeInTheDocument()
  })

  it('contains external links', () => {
    renderWithI18n(<AboutIpfs t={i18n.t} />)

    // Check for external links
    const links = screen.getAllByRole('link')
    const externalLinks = links.filter(link =>
      link.getAttribute('target') === '_blank' &&
      link.getAttribute('rel') === 'noopener noreferrer'
    )

    expect(externalLinks.length).toBeGreaterThan(0)
  })

  it('renders with proper structure', () => {
    renderWithI18n(<AboutIpfs t={i18n.t} />)

    // Check for proper HTML structure
    const header = screen.getByRole('heading', { level: 2 })
    expect(header).toBeInTheDocument()

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(5) // Should have 5 list items
  })

  it('wraps content in Box component', () => {
    renderWithI18n(<AboutIpfs t={i18n.t} />)

    expect(screen.getByTestId('box')).toBeInTheDocument()
  })

  it('contains code elements', () => {
    renderWithI18n(<AboutIpfs t={i18n.t} />)

    // Check for code elements (like https://dweb.link)
    const codeElements = screen.getAllByText(/https:\/\/dweb\.link/)
    expect(codeElements.length).toBeGreaterThan(0)
  })

  it('handles different languages', async () => {
    // Test with a different language
    await i18n.changeLanguage('es')
    renderWithI18n(<AboutIpfs t={i18n.t} />)

    // The component should still render without errors
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
