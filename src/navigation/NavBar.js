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
  }, ['dt dt--fixed pv3 mb2 white no-underline focus-outline f5 hover-bg-white-10'])
  const svgClass = classnames({
    'o-100': active,
    'o-50': !active
  }, ['fill-current-color'])

  return (
    <a href={disabled ? null : href} className={anchorClass} role='menuitem' title={children}>
      <span className={`dtc v-mid ${open ? 'tr' : 'tc'}`} style={{ width: 100 }}>
        <Svg width='50' className={svgClass} />
      </span>
      <span className='dtc v-mid pl3'>
        {open ? children : null}
      </span>
    </a>
  )
}

export const NavBar = ({ t, isSettingsEnabled, width, open, onToggle }) => (
  <div id='navbar' style={{ width }}>
    <div className='pointer' style={{ paddingTop: 35 }} onClick={onToggle}>
      <img className='center' style={{ height: 70, display: open ? 'block' : 'none' }} src={ipfsLogoText} alt='IPFS' title='Toggle navbar' />
      <img className='center' style={{ height: 70, display: open ? 'none' : 'block' }} src={ipfsLogo} alt='IPFS' title='Toggle navbar' />
    </div>
    <nav className='db pt4' role='menubar'>
      <NavLink to='/' exact icon={StrokeMarketing} open={open}>{t('status:title')}</NavLink>
      <NavLink to='/files/' icon={StrokeWeb} open={open}>{t('files:title')}</NavLink>
      <NavLink to='/explore' icon={StrokeIpld} open={open}>{t('explore:tabName')}</NavLink>
      <NavLink to='/peers' icon={StrokeCube} open={open}>{t('peers:title')}</NavLink>
      <NavLink to='/settings' icon={StrokeSettings} disabled={!isSettingsEnabled} open={open}>{t('settings:title')}</NavLink>
    </nav>
  </div>
)

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
