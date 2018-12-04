import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate, Trans } from 'react-i18next'
import Box from '../components/box/Box'
import Checkbox from '../components/checkbox/Checkbox'
import Title from './Title'

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
const altKey = isMac ? '⌥ option' : 'ALT'
const ctrlKey = isMac ? '⌘ command' : 'CTRL'

const isJavascript = (value) => {
  return value === 'js'
}

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
    <div>
    <Box className='mb3 pa4'>
      <Title>{t('ipfsDesktop')}</Title>

      <CheckboxSetting checked={desktopSettings['autoLaunch'] || false}
        title={t('launchOnStartup')}
        onChange={() => doDesktopSettingsToggle('autoLaunch')} />
      <CheckboxSetting checked={desktopSettings['screenshotShortcut'] || false}
        title={t('autoAddScreenshots')}
        onChange={() => doDesktopSettingsToggle('screenshotShortcut')}>
        <p className='mb0 mt1 lh-copy'>
          <Trans
            i18nKey='autoAddScreenshotsDescription'
            defaults='Use <0>{ctrlKey}</0> + <2>{altKey}</2> + <3>S</3> to take screenshots and add them to the repository.'
            values={{ ctrlKey, altKey }}
            components={[<Key>0</Key>, <Key>0</Key>, <Key>0</Key>, <Key>0</Key>]} />
        </p>
      </CheckboxSetting>
      <CheckboxSetting checked={desktopSettings['downloadHashShortcut'] || false}
        title={t('downloadCopiedHash')}
        onChange={() => doDesktopSettingsToggle('downloadHashShortcut')}>
        <p className='mb0 mt1 lh-copy'>
          <Trans
            i18nKey='downloadCopiedHashDescription'
            defaults='Use <0>{ctrlKey}</0> + <2>{altKey}</2> + <3>D</3> to download the last copied hash.'
            values={{ ctrlKey, altKey }}
            components={[<Key>0</Key>, <Key>0</Key>, <Key>0</Key>, <Key>0</Key>]} />
        </p>
      </CheckboxSetting>
    </Box>
    <Box className='mb3 pa4'>
    <span>
      <CheckboxSetting checked={isJavascript(desktopSettings['type']) || false }
        title={t('IPFS Implementation')}
        onChange={() => doDesktopSettingsToggle('type')}>
        <p className='mb0 mt1 lh-copy'> Enable Javascript </p>
      </CheckboxSetting>
      <p> The javascript implementation does not yet have feature parity with the go implementation.  For more info please see:  </p>
      </span>
    </Box>
    </div>
  )
}

export const TranslatedDesktopSettings = translate('settings')(DesktopSettings)

export default connect(
  'selectDesktopSettings',
  'doDesktopSettingsToggle',
  TranslatedDesktopSettings
)
