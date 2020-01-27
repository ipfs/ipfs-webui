import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../components/box/Box'
import Checkbox from '../components/checkbox/Checkbox'
import Title from './Title'

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

const keys = {
  option: '⌥ option',
  cmd: '⌘ command',
  ctrlMac: '⌃ control',
  alt: 'ALT',
  ctrl: 'CTRL'
}

const CheckboxSetting = ({ children, title, ...props }) => (
  <div className='mt2'>
    <div className='flex items-center'>
      <div className='w2'>
        <Checkbox {...props} className='mr1' />
      </div>
      <p className='ma0 f6 b'>{title}</p>
    </div>

    <p className='pl4 charcoal mw7 mb0 mt1 f6 lh-copy'>
      <span>{children}</span>
    </p>
  </div>
)

const Key = ({ children }) => <span className='monospace br2 bg-snow ph1'>{ children }</span>

export function DesktopSettings ({ t, doDesktopSettingsToggle, desktopSettings, desktopPlatform }) {
  return (
    <Box className='mb3 pa4'>
      <Title>{t('ipfsDesktop')}</Title>

      <CheckboxSetting checked={desktopSettings.autoLaunch || false}
        title={t('launchOnStartup')}
        disabled={!(['win32', 'darwin', 'linux'].includes(desktopPlatform))}
        onChange={() => doDesktopSettingsToggle('autoLaunch')} />
      <CheckboxSetting checked={desktopSettings.ipfsOnPath || false}
        title={t('ipfsCmdTools')}
        disabled={desktopPlatform === 'win32'}
        onChange={() => doDesktopSettingsToggle('ipfsOnPath')}>
        <Trans
          i18nKey='ipfsCmdToolsDescription'
          defaults='Add <0>ipfs</0> binary to your system <0>PATH</0> so you can use it in the command line.'
          components={[<Key>0</Key>, <Key>0</Key>, <Key>0</Key>, <Key>0</Key>]} />
      </CheckboxSetting>

      <p className='ttu tracked f7 aqua mt4 mb2'>{t('globalShortcuts')}</p>
      <p className='f6 charcoal lh-copy mw7'>{t('globalShortcutsAre')}</p>

      <CheckboxSetting checked={desktopSettings.screenshotShortcut || false}
        title={t('takeScreenshot')}
        onChange={() => doDesktopSettingsToggle('screenshotShortcut')}>
        <Trans
          i18nKey='takeScreenshotDescription'
          defaults='Use <0>{key1}</0> + <2>{key2}</2> + <3>{key3}</3> to take screenshots and add them to your repository.'
          values={{
            key1: isMac ? keys.cmd : keys.ctrl,
            key2: isMac ? keys.ctrlMac : keys.alt,
            key3: 'S'
          }}
          components={[<Key>0</Key>, <Key>0</Key>, <Key>0</Key>, <Key>0</Key>]} />
      </CheckboxSetting>
      <CheckboxSetting checked={desktopSettings.downloadHashShortcut || false}
        title={t('downloadHash')}
        onChange={() => doDesktopSettingsToggle('downloadHashShortcut')}>
        <Trans
          i18nKey='downloadHashDescription'
          defaults='Use <0>{key1}</0> + <2>{key2}</2> + <3>{key3}</3> to download the last copied hash or path to your system.'
          values={{
            key1: isMac ? keys.cmd : keys.ctrl,
            key2: isMac ? keys.ctrlMac : keys.alt,
            key3: isMac ? 'H' : 'D'
          }}
          components={[<Key>0</Key>, <Key>0</Key>, <Key>0</Key>, <Key>0</Key>]} />
      </CheckboxSetting>
    </Box>
  )
}

export const TranslatedDesktopSettings = withTranslation('settings')(DesktopSettings)

export default connect(
  'selectDesktopSettings',
  'selectDesktopPlatform',
  'doDesktopSettingsToggle',
  TranslatedDesktopSettings
)
