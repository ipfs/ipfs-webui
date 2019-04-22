import React from 'react'
import os from 'os'
import { connect } from 'redux-bundler-react'
import { translate, Trans } from 'react-i18next'
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
      { os.platform() !== 'win32' &&
        <CheckboxSetting checked={desktopSettings['ipfsOnPath'] || false}
          title={t('ipfsCmdTools')}
          disabled={os.platform() === 'win32'}
          onChange={() => doDesktopSettingsToggle('ipfsOnPath')}>
          <p className='mb0 mt1 lh-copy'>
            <Trans
              i18nKey='ipfsCmdToolsDescription'
              defaults='Add <0>ipfs</0> binary to your system <0>PATH</0> so you can use it in the command line.'
              components={[<Key>0</Key>, <Key>0</Key>, <Key>0</Key>, <Key>0</Key>]} />
          </p>
        </CheckboxSetting>
      }
    </Box>
  )
}

export const TranslatedDesktopSettings = translate('settings')(DesktopSettings)

export default connect(
  'selectDesktopSettings',
  'doDesktopSettingsToggle',
  TranslatedDesktopSettings
)
