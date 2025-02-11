import React from 'react'

export interface ThemeProviderProps {
  children: React.ReactNode
}

export type Theme = 'light' | 'dark'

export type ThemeContextValues = {
  darkTheme: boolean,
  toggleTheme: (event?: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => void;
}

export const ThemeContext = React.createContext<ThemeContextValues | null>(null)

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkTheme, setDarkTheme] = React.useState<boolean>(() => {
    const savedTheme =
      typeof window !== 'undefined' && localStorage.getItem('theme')
    if (savedTheme) return savedTheme === 'dark'
    return window.matchMedia('prefers-color-scheme: dark').matches
  })
  React.useEffect(() => {
    const htmlElem = document.documentElement
    const currentTheme = isDarkTheme ? 'dark' : 'light'
    htmlElem.setAttribute('data-theme', currentTheme)
    localStorage.setItem('theme', currentTheme)
    htmlElem.setAttribute('aria-label', `Current theme: ${currentTheme}`)
  }, [isDarkTheme])
  const toggleTheme = (event: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (event.type === 'keydown') {
      const isKeyboardEvent = (event: React.KeyboardEvent | React.MouseEvent): event is React.KeyboardEvent<HTMLButtonElement> => {
        return event.type === 'keydown'
      }
      if (isKeyboardEvent(event)) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setDarkTheme((prevTheme) => !prevTheme)
        }
      }
      setDarkTheme((prevTheme) => !prevTheme)
    }
  }
  const values: ThemeContextValues = {
    darkTheme: isDarkTheme,
    toggleTheme: (event) => {
      event ? toggleTheme(event) : setDarkTheme(prevTheme => !prevTheme)
    }
  }
  return (
    <ThemeContext.Provider value={values}>
      {children}
    </ThemeContext.Provider>
  )
}
