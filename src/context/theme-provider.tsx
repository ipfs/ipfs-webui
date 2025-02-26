import React, { useEffect } from 'react'

export interface ThemeProviderProps {
  children: React.ReactNode
}

export type Theme = 'light' | 'dark'

export type ThemeContextValues = {
  darkTheme: boolean,
  toggleTheme: (event?: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement> | undefined) => void;
}

export const ThemeContext = React.createContext<ThemeContextValues | null>(null)

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const [isDarkTheme, setDarkTheme] = React.useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme === 'dark'
    return mediaQuery.matches
  })

  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) => {
      console.log('changed theme?')
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        setDarkTheme(event.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mediaQuery])

  useEffect(() => {
    const htmlElem = document.documentElement
    const currentTheme = isDarkTheme ? 'dark' : 'light'
    htmlElem.setAttribute('data-theme', currentTheme)
    htmlElem.setAttribute('aria-label', `Current theme: ${currentTheme}`)

    if (isDarkTheme === mediaQuery.matches) {
      // delete localstorage item when dark=dark or light=light
      localStorage.removeItem('theme')
    } else {
      // save to local storage when it differs from local settings
      localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light')
    }
  }, [isDarkTheme, mediaQuery])

  const toggleTheme = (event: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement> | undefined) => {
    if (event?.type === 'keydown') {
      const isKeyboardEvent = (event: React.KeyboardEvent | React.MouseEvent): event is React.KeyboardEvent<HTMLButtonElement> => {
        return event.type === 'keydown'
      }
      if (isKeyboardEvent(event)) {
        if (event.key === ' ') {
          event.preventDefault()
          setDarkTheme((prevTheme) => !prevTheme)
        }
      }
    } else {
      setDarkTheme((prevTheme) => !prevTheme)
    }
  }

  const values: ThemeContextValues = {
    darkTheme: isDarkTheme,
    toggleTheme
  }
  return (
    <ThemeContext.Provider value={values}>
      {children}
    </ThemeContext.Provider>
  )
}
