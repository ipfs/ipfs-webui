import React from 'react'
import { connect } from 'redux-bundler-react'
import { THEMES } from '../../bundles/theme.js'
import StrokeSun from '../../icons/StrokeSun'
import StrokeMoon from '../../icons/StrokeMoon'
import StrokeMonitor from '../../icons/StrokeMonitor'

const ThemeToggle = ({ theme, doSetTheme, className = '' }) => {
  const getIcon = () => {
    const iconStyle = {
      width: 24,
      height: 24,
      color: 'var(--theme-text-primary)',
      stroke: 'var(--theme-text-primary)'
    }

    switch (theme) {
      case THEMES.LIGHT:
        return <StrokeSun style={iconStyle} />
      case THEMES.DARK:
        return <StrokeMoon style={iconStyle} />
      case THEMES.SYSTEM:
        return <StrokeMonitor style={iconStyle} />
      default:
        return <StrokeSun style={iconStyle} />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return 'Light'
      case THEMES.DARK:
        return 'Dark'
      case THEMES.SYSTEM:
        return 'System'
      default:
        return 'Light'
    }
  }

  const cycleTheme = () => {
    const themes = [THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM]
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    doSetTheme(nextTheme)
  }

  return (
    <button
      onClick={cycleTheme}
      className={`flex items-center pa2 br2 bn pointer ${className}`}
      style={{
        background: 'transparent',
        transition: 'background-color 0.2s ease',
        color: 'var(--theme-text-primary)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-bg-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      title={`Theme: ${getLabel()} (click to change)`}
      aria-label={`Current theme: ${getLabel()}. Click to cycle through themes.`}
    >
      <span className="flex items-center">
        {getIcon()}
      </span>
    </button>
  )
}

export default connect(
  'selectTheme',
  'doSetTheme',
  ThemeToggle
)
