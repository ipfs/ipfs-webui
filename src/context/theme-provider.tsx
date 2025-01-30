import React from 'react'

export interface ThemeProviderProps {
  children: React.ReactNode
}

export type Theme = 'light' | 'dark'

export type ThemeContextValues = {
  currentTheme: Theme,
  toggleTheme: () => void;
  toggleThemeWithKey: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const createThemeContext = () => React.createContext<ThemeContextValues | null>(null)
export const ThemeContext = createThemeContext()

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = React.useState<boolean>(() => {
    const savedTheme =
      typeof window !== 'undefined' && localStorage.getItem('theme')
    if (savedTheme) return savedTheme === 'dark'
    return window.matchMedia('prefers-color-scheme: dark').matches
  })
  React.useEffect(() => {
    const htmlElem = document.documentElement
    const currentTheme = theme ? 'dark' : 'light'
    htmlElem.setAttribute('data-theme', currentTheme)
    localStorage.setItem('theme', currentTheme)
    htmlElem.setAttribute('aria-label', `Current theme: ${currentTheme}`)
  }, [theme])
  const toggleTheme = () => setTheme((prevTheme) => !prevTheme)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleTheme()
    }
  }
  const values: ThemeContextValues = {
    currentTheme: theme as unknown as Theme,
    toggleTheme,
    toggleThemeWithKey: handleKeyDown
  }
  return (
    <ThemeContext.Provider value={values}>
      {children}
    </ThemeContext.Provider>
  )
}
