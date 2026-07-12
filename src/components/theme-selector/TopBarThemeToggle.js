import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/theme-context.js'
import StrokeMonitor from '../../icons/StrokeMonitor.js'

const SunIcon = ({ className, width, height }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={width} height={height}>
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
)

const MoonIcon = ({ className, width, height }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={width} height={height}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
)

export const TopBarThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation('settings')

  const cycleTheme = () => {
    if (theme === 'auto') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('auto')
  }

  let Icon = StrokeMonitor
  if (theme === 'light') Icon = SunIcon
  if (theme === 'dark') Icon = MoonIcon

  return (
    <button
      className="button-reset bg-transparent bn p0 m0 mr3 flex items-center justify-center pointer charcoal-muted hover-navy transition-all glow"
      onClick={cycleTheme}
      title={t('themeDescription')}
      style={{ width: 28, height: 28, outline: 'none' }}
    >
      <Icon width={24} height={24} className="fill-current-color" />
    </button>
  )
}

export default TopBarThemeToggle
