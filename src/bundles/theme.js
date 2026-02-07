import { createSelector } from 'redux-bundler'
import { readSetting, writeSetting } from './local-storage.js'

const THEME_KEY = 'ipfs-theme'
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

const getSystemTheme = () => {
  if (typeof window === 'undefined') return THEMES.LIGHT
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT
}

const getInitialTheme = () => {
  const saved = readSetting(THEME_KEY)
  if (saved && Object.values(THEMES).includes(saved)) {
    return saved
  }
  // Default to dark theme instead of system
  return THEMES.DARK
}

const applyTheme = (theme) => {
  const effectiveTheme = theme === THEMES.SYSTEM ? getSystemTheme() : theme
  document.documentElement.setAttribute('data-theme', effectiveTheme)
  document.documentElement.classList.remove('theme-light', 'theme-dark')
  document.documentElement.classList.add(`theme-${effectiveTheme}`)
}

const bundle = {
  name: 'theme',

  reducer: (state = getInitialTheme(), action) => {
    if (action.type === 'THEME_SET') {
      return action.payload
    }
    return state
  },

  selectTheme: state => state.theme,

  selectEffectiveTheme: createSelector(
    'selectTheme',
    (theme) => {
      return theme === THEMES.SYSTEM ? getSystemTheme() : theme
    }
  ),

  doSetTheme: (theme) => ({ dispatch }) => {
    if (!Object.values(THEMES).includes(theme)) {
      console.error(`Invalid theme: ${theme}`)
      return
    }
    writeSetting(THEME_KEY, theme)
    applyTheme(theme)
    dispatch({ type: 'THEME_SET', payload: theme })
  },

  doToggleTheme: () => ({ dispatch, store }) => {
    const currentTheme = store.selectTheme()
    const themes = [THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM]
    const currentIndex = themes.indexOf(currentTheme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    dispatch({ actionCreator: 'doSetTheme', args: [nextTheme] })
  },

  init: (store) => {
    // Apply initial theme
    const theme = store.selectTheme()
    applyTheme(theme)

    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const currentTheme = store.selectTheme()
        if (currentTheme === THEMES.SYSTEM) {
          applyTheme(THEMES.SYSTEM)
        }
      }

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
      }
    }
  }
}

export default bundle
export { THEMES }
