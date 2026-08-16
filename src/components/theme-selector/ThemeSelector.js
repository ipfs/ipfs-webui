import React from 'react'
import { withTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/theme-context.js'
import Title from '../../settings/Title.js'

const ThemeSelector = ({ t }) => {
  const { theme, setTheme } = useTheme()

  const onChange = (e) => {
    setTheme(e.target.value)
  }

  return (
    <div className='joyride-settings-theme'>
      <Title>{t('theme') || 'Theme'}</Title>
      <div className='flex items-center'>
        <select
          className='w-100 mw4 pa2 ba b--black-20 br1 charcoal bg-white focus-outline focus-outline-blue'
          value={theme}
          onChange={onChange}
        >
          <option value='auto'>{t('themeAuto')}</option>
          <option value='light'>{t('themeLight')}</option>
          <option value='dark'>{t('themeDark')}</option>
        </select>
        <span className='ml3 f6 charcoal-muted'>
          {t('themeDescription') || 'Choose a theme or sync with your system preference.'}
        </span>
      </div>
    </div>
  )
}

export default withTranslation('settings')(ThemeSelector)
