import React, { createContext, useContext, useEffect, useState } from 'react'

/** @type {string[]} Allowed theme values — any other value from localStorage is treated as 'auto' */
const ALLOWED_THEMES = ['auto', 'light', 'dark']

// Default theme is auto
const DEFAULT_THEME = 'auto'

/**
 * Safely read a value from localStorage, falling back to DEFAULT_THEME on any error.
 * localStorage.getItem can throw a SecurityError in private-browsing / Tor Browser modes.
 * @returns {'auto'|'light'|'dark'}
 */
function readStoredTheme () {
  try {
    const stored = localStorage.getItem('ipfs-webui-theme')
    return ALLOWED_THEMES.includes(stored) ? stored : DEFAULT_THEME
  } catch (_e) {
    return DEFAULT_THEME
  }
}

/**
 * Safely write a value to localStorage, ignoring any write error.
 * @param {string} theme
 */
function writeStoredTheme (theme) {
  try {
    localStorage.setItem('ipfs-webui-theme', theme)
  } catch (_e) {
    // ignore write errors in restricted environments (e.g. Tor Browser strict mode)
  }
}

export const ThemeContext = createContext({
  theme: 'auto',
  /** The resolved 'light' | 'dark' value, updated reactively when the OS scheme changes in 'auto' mode */
  resolvedTheme: 'light',
  setTheme: (/** @type {string} */ _newTheme) => {}
})

export const useTheme = () => useContext(ThemeContext)

/**
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => readStoredTheme())

  // resolvedTheme tracks the effective light/dark value so that consumers
  // (e.g. Speedometer, NodeBandwidthChart) re-render when the OS scheme
  // flips while the user is in 'auto' mode. (lidel review: expose resolved value)
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false }
    const stored = readStoredTheme()
    if (stored === 'dark') return 'dark'
    if (stored === 'light') return 'light'
    return mediaQuery.matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : { matches: false, addEventListener: () => {}, removeEventListener: () => {} }

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'auto' && mediaQuery.matches)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      // Keep resolvedTheme in sync so chart consumers re-render on OS scheme change
      setResolvedTheme(isDark ? 'dark' : 'light')
    }

    applyTheme()

    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  /**
   * @param {string} newTheme
   */
  const setTheme = (newTheme) => {
    const validated = ALLOWED_THEMES.includes(newTheme) ? newTheme : DEFAULT_THEME
    writeStoredTheme(validated)
    setThemeState(validated)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
