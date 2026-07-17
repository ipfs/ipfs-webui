import React, { createContext, useContext, useEffect, useState } from 'react'

export const ThemeContext = createContext({
  theme: 'auto',
  setTheme: (/** @type {string} */ _newTheme) => {}
})

export const useTheme = () => useContext(ThemeContext)

// Default theme is auto
const DEFAULT_THEME = 'auto'

/**
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('ipfs-webui-theme') || DEFAULT_THEME
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : { matches: false, addEventListener: () => {}, removeEventListener: () => {} }

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'auto' && mediaQuery.matches)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
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
    localStorage.setItem('ipfs-webui-theme', newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
