import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate, Interpolate } from 'react-i18next'
import Box from '../components/box/Box'
import Checkbox from '../components/checkbox/Checkbox'
import Title from './Title'

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
const altKey = isMac ? '⌥ option' : 'ALT'
const ctrlKey = isMac ? '⌘ command' : 'CTRL'

const CheckboxSetting = ({ children, title, ...props }) => (
  <div className='mt2'>
    <div className='flex items-center'>
      <div className='w2'>
        <Checkbox {...props} className='mr1' />
      </div>
      <p className='ma0 f6 b'>{title}</p>
    </div>

    <div className='pl4'>
      <span>{children}</span>
    </div>
  </div>
)

const Key = ({ children }) => <span className='monospace br2 bg-snow ph1'>{ children }</span>

export function DesktopSettings ({ t, doDesktopSettingsToggle, desktopSettings }) {
  return (
    <Box className='mb3 pa4'>
      <Title>{t('ipfsDesktop')}</Title>

      <CheckboxSetting checked={desktopSettings['autoLaunch'] || false}
        title={t('launchOnStartup')}
        onChange={() => doDesktopSettingsToggle('autoLaunch')} />
      <CheckboxSetting checked={desktopSettings['screenshotShortcut'] || false}
        title={t('autoAddScreenshots')}
        onChange={() => doDesktopSettingsToggle('screenshotShortcut')}>
        <p className='mb0 mt1 lh-copy'>
          <Interpolate t={t} i18nKey='autoAddScreenshotsDescription' combo={<span><Key>{ctrlKey}</Key>+<Key>{altKey}</Key>+<Key>S</Key></span>} />
        </p>
      </CheckboxSetting>
      <CheckboxSetting checked={desktopSettings['downloadHashShortcut'] || false}
        title={t('downloadCopiedHash')}
        onChange={() => doDesktopSettingsToggle('downloadHashShortcut')}>
        <p className='mb0 mt1 lh-copy'>
          <Interpolate t={t} i18nKey='downloadCopiedHashDescription' combo={<span><Key>{ctrlKey}</Key>+<Key>{altKey}</Key>+<Key>D</Key></span>} />
        </p>
      </CheckboxSetting>
    </Box>
  )
}

export default connect(
  'selectDesktopSettings',
  'doDesktopSettingsToggle',
  translate('settings')(DesktopSettings)
)
