import React from 'react'
import '@testing-library/jest-dom'
import { render, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './theme-context.js'

const TestConsumer = () => {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid='current-theme'>{theme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('auto')}>Set Auto</button>
    </div>
  )
}

describe('ThemeContext & ThemeProvider', () => {
  /** @type {Array<(e: any) => void>} */
  let listeners = []
  let matchesDark = false

  beforeEach(() => {
    localStorage.clear()
    listeners = []
    matchesDark = false

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      get matches () {
        return matchesDark
      },
      media: query,
      onchange: null,
      addEventListener: jest.fn((_event, cb) => {
        if (_event === 'change') listeners.push(cb)
      }),
      removeEventListener: jest.fn((_event, cb) => {
        listeners = listeners.filter(l => l !== cb)
      })
    }))

    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('defaults to auto and sets data-theme to light when system theme is light', () => {
    matchesDark = false
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(getByTestId('current-theme').textContent).toBe('auto')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('defaults to auto and sets data-theme to dark when system theme is dark', () => {
    matchesDark = true
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(getByTestId('current-theme').textContent).toBe('auto')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('sets theme to dark, persists in localStorage, and updates data-theme attribute', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    act(() => {
      getByText('Set Dark').click()
    })

    expect(getByTestId('current-theme').textContent).toBe('dark')
    expect(localStorage.getItem('ipfs-webui-theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('sets theme to light, persists in localStorage, and updates data-theme attribute', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    act(() => {
      getByText('Set Light').click()
    })

    expect(getByTestId('current-theme').textContent).toBe('light')
    expect(localStorage.getItem('ipfs-webui-theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('restores theme from localStorage on initial render', () => {
    localStorage.setItem('ipfs-webui-theme', 'dark')

    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(getByTestId('current-theme').textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('reacts dynamically to system color scheme changes when in auto mode', () => {
    matchesDark = false
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    // Simulate system changing to dark mode
    matchesDark = true
    act(() => {
      listeners.forEach(listener => listener({ matches: true }))
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    // Simulate system changing back to light mode
    matchesDark = false
    act(() => {
      listeners.forEach(listener => listener({ matches: false }))
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('does not change theme on system preference change when an explicit theme is selected', () => {
    matchesDark = false
    const { getByText } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    act(() => {
      getByText('Set Light').click()
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    // System switches to dark, but user explicitly chose light
    matchesDark = true
    act(() => {
      listeners.forEach(listener => listener({ matches: true }))
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('cleans up matchMedia event listener on unmount', () => {
    const { unmount } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(listeners.length).toBeGreaterThan(0)
    unmount()
    expect(listeners.length).toBe(0)
  })
})
