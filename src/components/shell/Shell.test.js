import React from 'react'
import { render, screen } from '@testing-library/react'
import Shell from './Shell.js'

describe('Shell', () => {
  it('renders with default title', () => {
    render(
      <Shell>
        <div>Shell content</div>
      </Shell>
    )

    expect(screen.getByText('Shell')).toBeInTheDocument()
    expect(screen.getByText('Shell content')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    render(
      <Shell title="Custom Shell">
        <div>Shell content</div>
      </Shell>
    )

    expect(screen.getByText('Custom Shell')).toBeInTheDocument()
    expect(screen.getByText('Shell content')).toBeInTheDocument()
  })

  it('renders with default className', () => {
    render(
      <Shell>
        <div>Shell content</div>
      </Shell>
    )

    const shell = screen.getByText('Shell content').closest('div').parentElement
    expect(shell).toHaveClass('br1', 'overflow-hidden')
  })

  it('renders with custom className', () => {
    render(
      <Shell className="custom-class">
        <div>Shell content</div>
      </Shell>
    )

    const shell = screen.getByText('Shell content').closest('div').parentElement
    expect(shell).toHaveClass('br1', 'overflow-hidden', 'custom-class')
  })

  it('renders title with correct styling', () => {
    render(
      <Shell title="Test Title">
        <div>Shell content</div>
      </Shell>
    )

    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('f7', 'mb0', 'sans-serif', 'ttu', 'tracked', 'charcoal', 'pv1', 'pl2', 'bg-black-20')
  })

  it('renders content with correct styling', () => {
    render(
      <Shell>
        <div>Shell content</div>
      </Shell>
    )

    const content = screen.getByText('Shell content').closest('div')
    expect(content).toHaveClass('bg-black-70', 'snow', 'pa2', 'f7', 'lh-copy', 'monospace', 'nowrap', 'overflow-x-auto')
  })

  it('renders multiple children', () => {
    render(
      <Shell>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </Shell>
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
    expect(screen.getByText('Third child')).toBeInTheDocument()
  })

  it('renders without children', () => {
    render(<Shell />)

    expect(screen.getByText('Shell')).toBeInTheDocument()
    const content = screen.getByText('Shell').nextElementSibling
    expect(content).toBeEmptyDOMElement()
  })

  it('renders with empty title', () => {
    render(
      <Shell title="">
        <div>Shell content</div>
      </Shell>
    )

    const title = screen.getByText('Shell content').previousElementSibling
    expect(title).toBeEmptyDOMElement()
  })

  it('renders with null title', () => {
    render(
      <Shell title={null}>
        <div>Shell content</div>
      </Shell>
    )

    const title = screen.getByText('Shell content').previousElementSibling
    expect(title).toBeEmptyDOMElement()
  })

  it('renders with undefined title', () => {
    render(
      <Shell title={undefined}>
        <div>Shell content</div>
      </Shell>
    )

    expect(screen.getByText('Shell')).toBeInTheDocument()
  })

  it('handles complex children', () => {
    render(
      <Shell>
        <div>
          <span>Nested content</span>
          <button>Button</button>
        </div>
      </Shell>
    )

    expect(screen.getByText('Nested content')).toBeInTheDocument()
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('renders with proper structure', () => {
    render(
      <Shell title="Test Shell">
        <div>Test content</div>
      </Shell>
    )

    const shell = screen.getByText('Test content').closest('div').parentElement
    const title = screen.getByText('Test Shell')
    const content = screen.getByText('Test content').closest('div')

    expect(shell).toContainElement(title)
    expect(shell).toContainElement(content)
    expect(title).toBeInTheDocument()
    expect(content).toBeInTheDocument()
  })
})
