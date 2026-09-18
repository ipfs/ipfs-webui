import themeBundle, { THEMES } from './theme.js'

describe('theme bundle', () => {
  it('should have correct name', () => {
    expect(themeBundle.name).toBe('theme')
  })

  it('should export THEMES constants', () => {
    expect(THEMES.LIGHT).toBe('light')
    expect(THEMES.DARK).toBe('dark')
    expect(THEMES.SYSTEM).toBe('system')
  })

  it('should have initial state', () => {
    const state = themeBundle.reducer(undefined, {})
    expect([THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM]).toContain(state)
  })

  it('should handle THEME_SET action', () => {
    const state = themeBundle.reducer(THEMES.LIGHT, {
      type: 'THEME_SET',
      payload: THEMES.DARK
    })
    expect(state).toBe(THEMES.DARK)
  })

  it('should select theme from state', () => {
    const state = { theme: THEMES.DARK }
    expect(themeBundle.selectTheme(state)).toBe(THEMES.DARK)
  })
})
