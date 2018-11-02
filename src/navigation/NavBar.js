import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import classnames from 'classnames'
import ipfsLogo from './ipfs-logo.svg'
import ipfsLogoText from './ipfs-logo-text.svg'
import StrokeMarketing from '../icons/StrokeMarketing'
import StrokeWeb from '../icons/StrokeWeb'
import StrokeCube from '../icons/StrokeCube'
import StrokeSettings from '../icons/StrokeSettings'
import StrokeIpld from '../icons/StrokeIpld'

// Styles
import './Navbar.css'

const NavLink = ({
  to,
  icon,
  open,
  exact,
  disabled,
  children,
  className,
  activeClassName
}) => {
  const Svg = icon
  const { hash } = window.location
  const href = `#${to}`
  const active = exact ? hash === href : hash && hash.startsWith(href)
  const anchorClass = classnames({
    'bg-white-10': active,
    'o-50 no-pointer-events': disabled
  }, ['dib db-l pv3 white no-underline focus-outline f5 hover-bg-white-10 tc'])
  const svgClass = classnames({
    'o-100': active,
    'o-50': !active
  }, ['fill-current-color'])

  return (
    <a href={disabled ? null : href} className={anchorClass} role='menuitem' title={children}>
      <span className={`dib ${open ? 'dt-l' : ''}`}>
        <span className={`dib dtc-l v-mid ${open ? 'pl3 pl5-l' : 'ph3'}`} style={{ width: 50 }}>
          <Svg width='50' className={svgClass} />
        </span>
        <span className={`${open ? 'dib dtc-l' : 'dn'} pl2 pl3-l pr3 tl-l v-mid `}>
          {children}
        </span>
      </span>
    </a>
  )
}

export const NavBar = ({ t, isSettingsEnabled, width, open, onToggle }) => {
  const codeUrl = 'https://github.com/ipfs-shipyard/ipfs-webui'
  const bugsUrl = `${codeUrl}/issues`
  const gitRevision = process.env.REACT_APP_GIT_REV
  const revisionUrl = `${codeUrl}/commit/${gitRevision}`
  return (
    <div className='h-100 fixed-l flex flex-column justify-between' style={{ width: 'inherit' }}>
      <div className='flex flex-column'>
        <div className='pointer pv3 pv4-l' onClick={onToggle}>
          <img className='center' style={{ height: 70, display: open ? 'block' : 'none' }} src={ipfsLogoText} alt='IPFS' title='Toggle navbar' />
          <img className='center' style={{ height: 70, display: open ? 'none' : 'block' }} src={ipfsLogo} alt='IPFS' title='Toggle navbar' />
        </div>
        <nav className='db overflow-x-scroll nowrap tc' role='menubar'>
          <NavLink to='/' exact icon={StrokeMarketing} open={open}>{t('status:title')}</NavLink>
          <NavLink to='/files/' icon={StrokeWeb} open={open}>{t('files:title')}</NavLink>
          <NavLink to='/explore' icon={StrokeIpld} open={open}>{t('explore:tabName')}</NavLink>
          <NavLink to='/peers' icon={StrokeCube} open={open}>{t('peers:title')}</NavLink>
          <NavLink to='/settings' icon={StrokeSettings} disabled={!isSettingsEnabled} open={open}>{t('settings:title')}</NavLink>
        </nav>
      </div>
      { open &&
        <div className='dn db-l navbar-footer mb3 center'>
          { gitRevision && <div className='tc mb1'>
            <a className='link white f7 o-80 glow' href={revisionUrl} target='_blank'>{t('status:revision')} {gitRevision}</a>
          </div> }
          <div className='flex flex-colum'>
            <a className='link white f7 o-50 glow' href={codeUrl} target='_blank'>{t('status:codeLink')}</a>
            <span className='mh2 white f7 o-50'>|</span>
            <a className='link white f7 o-50 glow' href={bugsUrl} target='_blank'>{t('status:bugsLink')}</a>
          </div>
        </div> }
    </div>
  )
}

export const NavBarContainer = ({ doToggleNavbar, configRaw, navbarIsOpen, navbarWidth, ...props }) => {
  const isSettingsEnabled = !!configRaw.data

  return (
    <NavBar
      isSettingsEnabled={isSettingsEnabled}
      open={navbarIsOpen}
      width={navbarWidth}
      onToggle={doToggleNavbar}
      {...props} />
  )
}

export default connect(
  'doToggleNavbar',
  'selectConfigRaw',
  'selectNavbarIsOpen',
  'selectNavbarWidth',
  translate()(NavBarContainer)
)
