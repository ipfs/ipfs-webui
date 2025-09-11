import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Box from './Box.js'

// Mock the ErrorBoundary component
jest.mock('../error/error-boundary.tsx', () => {
  return function MockErrorBoundary ({ children }) {
    return <div data-testid="error-boundary">{children}</div>
  }
})

describe('Box', () => {
  it('renders with default className', () => {
    render(
      <Box>
        <div>Test content</div>
      </Box>
    )

    const box = screen.getByText('Test content').closest('section')
    expect(box).toHaveClass('pa4')
    expect(box).toHaveStyle('background: #fbfbfb')
  })

  it('renders with custom className', () => {
    render(
      <Box className="custom-class">
        <div>Test content</div>
      </Box>
    )

    const box = screen.getByText('Test content').closest('section')
    expect(box).toHaveClass('custom-class')
  })

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: 'red', padding: '20px' }
    render(
      <Box style={customStyle}>
        <div>Test content</div>
      </Box>
    )
    const box = screen.getByText('Test content').closest('section')
    expect(box).toHaveStyle('background: #fbfbfb; background-color: red; padding: 20px')
  })

  it('wraps children in ErrorBoundary', () => {
    render(
      <Box>
        <div>Test content</div>
      </Box>
    )
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <Box>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </Box>
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
    expect(screen.getByText('Third child')).toBeInTheDocument()
  })

  it('handles empty children', () => {
    render(<Box />)

    const box = screen.getByTestId('error-boundary').closest('section')
    expect(box).toBeInTheDocument()
    expect(box).toHaveClass('pa4')
  })
})
