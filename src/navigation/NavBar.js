/* eslint-disable space-before-function-paren */
import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import './NavBar.css'
import RetroButton from '../components/common/atoms/RetroButton'
import RetroText from '../components/common/atoms/RetroText'
// import CloseMark from '../icons/retro/CloseMark'
import StarIcon from '../icons/retro/StarIcon'
import ExploreIcon from '../icons/retro/ExploreIcon'
import SettingsIcon from '../icons/retro/SettingsIcon'
import PeersIcon from '../icons/retro/PeersIcon'
import FilesIcon from '../icons/retro/FilesIcon'
import MultiverseLogo from '../icons/retro/MultiverseLogo'

function isElectron() {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true
  }

  return false
}

// Styles

const RetroNavLink = ({
  to,
  alternative,
  disabled,
  children,
  fontSize,
  color = 'rgba(255, 255, 255, 0.6)',
  activeColor = '#110D21',
  icon
}) => {
  const { hash } = window.location
  const href = `#${to}`
  const active = alternative
    ? hash === href || hash.startsWith(`${href}${alternative}`)
    : hash && hash.startsWith(href)

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      style={{
        width: '100%',
        minWidth: '70px',
        color: '#000',
        margin: '1px',
        marginRight: 0
      }}
      href={disabled ? null : href}
      role='menuitem'
      title={children}
    >
      <RetroButton height='40px' active={active}>
        {icon}
        <RetroText fontSize={fontSize} color={color} isActive={active} activeColor={activeColor}>
          {children}
        </RetroText>
      </RetroButton>

    </a>
  )
}

export const NavBar = ({ t }) => {
  const onCloseClick = () => {
    if (isElectron() && window.desktopControls) {
      window.desktopControls.close()
    }
  }

  // const onGreetzClick = () => {
  //   if (isElectron() && window.desktopControls) {
  //     window.desktopControls.greetz()
  //   }
  // }

  const isActiveButton = (alternative, to) => {
    const { hash } = window.location
    const href = `#${to}`
    return alternative
      ? hash === href || hash.startsWith(`${href}${alternative}`)
      : hash && hash.startsWith(href)
  }

  return (
    <div id='nav-bar' className='h-100 flex flex-column justify-between' style={{ overflowY: 'auto', width: 'inherit', marginBottom: 10 }}>
      <div className='flex flex-column overflow-x-hidden' style={{}}>
        <div id='top-bar' className='flex justify-between'>
          <div className="flex flex-row align-items-center">
            <button className='btn-toolbox btn-toolbox-close' onClick={e => { onCloseClick() }}></button>
            <button className='btn-toolbox btn-toolbox-min' onClick={e => { }}></button>
            <button className='btn-toolbox btn-toolbox-max btn-toolbox-disabled' onClick={e => { }}></button>
          </div>
          <div style={{ height: '28px', marginLeft: 20 }} className='flex items-center'>
            <MultiverseLogo style={{ padding: '6px' }} />
            <RetroText top='-1px' color='#fff' fontFamily='PixM'>
              Cold Storage for your NFT V4.20 By: Graviton
            </RetroText>
          </div>
          {/* <RetroButton id='close-button' width='28px' height='28px' style={{ marginRight: '1px' }} onClick={() => onCloseClick()}>
            <RetroText top='0'>
              <CloseMark />
            </RetroText>
          </RetroButton> */}
        </div>
        <div className='flex db nowrap tc overflow-x-auto' style={{ margin: '0 2px' }} role='menubar'>
          <RetroNavLink to='/' alternative="status" icon={<StarIcon color={isActiveButton('status', '/') ? '#110D21' : 'rgba(255,255,255,0.6)'} />}>{t('status:title')}</RetroNavLink>
          <div className='retro-h-divider'></div>
          <RetroNavLink to='/files' icon={<FilesIcon color={isActiveButton('', '/files') ? '#110D21' : 'rgba(255,255,255,0.6)'} />}>{t('files:title')}</RetroNavLink>
          <div className='retro-h-divider'></div>
          <RetroNavLink to='/explore' icon={<ExploreIcon color={isActiveButton('', '/explore') ? '#110D21' : 'rgba(255,255,255,0.6)'} />}>{t('explore:tabName')}</RetroNavLink>
          <div className='retro-h-divider'></div>
          <RetroNavLink to='/peers' icon={<PeersIcon color={isActiveButton('', '/peers') ? '#110D21' : 'rgba(255,255,255,0.6)'} />}>{t('peers:title')}</RetroNavLink>
          <div className='retro-h-divider'></div>
          <RetroNavLink to='/settings' icon={<SettingsIcon color={isActiveButton('', '/settings') ? '#110D21' : 'rgba(255,255,255,0.6)'} />}>{t('settings:title')}</RetroNavLink>
          {/* <RetroButton id='greetz-button' style={{ margin: '1px' }} minWidth='70px' height='28px' onClick={() => onGreetzClick()}>
            <RetroText>
              GreetZ
            </RetroText>
          </RetroButton> */}
        </div >
      </div >
    </div >
  )
}

export default connect(
  withTranslation()(NavBar)
)
