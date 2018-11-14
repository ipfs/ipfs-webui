import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import Box from '../components/box/Box'
import Checkbox from '../components/checkbox/Checkbox'
import Title from './Title'

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

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

export function DesktopSettings ({ doDesktopSettingsToggle, desktopSettings }) {
  return (
    <Box className='mb3 pa4'>
      <Title>IPFS Desktop</Title>

      <CheckboxSetting checked={desktopSettings['autoLaunch'] || false}
        title='Launch on startup'
        onChange={() => doDesktopSettingsToggle('autoLaunch')} />
      <CheckboxSetting checked={desktopSettings['screenshotShortcut'] || false}
        title='Auto add screenshots'
        onChange={() => doDesktopSettingsToggle('screenshotShortcut')}>
        <p className='mb0 mt1 lh-copy'>
          Use <Key>{isMac ? 'CMD' : 'CTRL'}</Key>+<Key>ALT</Key>+<Key>S</Key> to take screenshots and add them to the repository.
        </p>
      </CheckboxSetting>
      <CheckboxSetting checked={desktopSettings['downloadHashShortcut'] || false}
        title='Download copied hash'
        onChange={() => doDesktopSettingsToggle('downloadHashShortcut')}>
        <p className='mb0 mt1 lh-copy'>
          Use <Key>{isMac ? 'CMD' : 'CTRL'}</Key>+<Key>ALT</Key>+<Key>D</Key> to download the last copied hash.
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
