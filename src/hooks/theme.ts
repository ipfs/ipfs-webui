import React from 'react'
import { ThemeContext, ThemeContextValues } from '../context/theme-provider'

export const useTheme = (): ThemeContextValues => {
  const context = React.useContext(ThemeContext)
  if (context == null) {
    throw new Error('Theme context is missing You probably forgot to wrap the component depending on theme in <ThemeProvider />')
  }
  return context as ThemeContextValues
}
