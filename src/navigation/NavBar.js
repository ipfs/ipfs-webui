import React from 'react'
import { connect } from 'redux-bundler-react'
import ipfsLogo from './ipfs-logo.svg'
import StrokeMarketing from '../icons/StrokeMarketing'
import StrokeWeb from '../icons/StrokeWeb'
import StrokeCube from '../icons/StrokeCube'
import StrokeSettings from '../icons/StrokeSettings'
import StrokeIpld from '../icons/StrokeIpld'

const NavLink = ({
  to,
  icon,
  exact,
  disabled,
  children,
  className = `dt dt--fixed pv3 mb2 white link focus-outline f5 hover-bg-white-10 transition-all ${disabled ? 'o-0' : ''}`,
  activeClassName = 'bg-white-10'
}) => {
  const Svg = icon
  const {hash} = window.location
  const href = `#${to}`
  const active = exact ? hash === href : hash && hash.startsWith(href)
  const cls = active ? className + ' ' + activeClassName : className
  return (
    <a href={disabled ? null : href} className={cls} role='menuitem'>
      <span className='dtc v-mid tr' style={{width: 100}}>
        <Svg
          style={{
            width: 50,
            opacity: active ? 1 : 0.5
          }}
          className='fill-current-color' />
      </span>
      <span className='dtc v-mid pl3'>
        {children}
      </span>
    </a>
  )
}

export const NavBar = ({isSettingsEnabled}) => (
  <div>
    <a href='#/' className='db' style={{paddingTop: 35}}>
      <img className='db center' style={{height: 70}} src={ipfsLogo} alt='IPFS' />
    </a>
    <nav className='db pt4' role='menubar'>
      <NavLink to='/' exact icon={StrokeMarketing}>Status</NavLink>
      <NavLink to='/files/' icon={StrokeWeb}>Files</NavLink>
      <NavLink to='/explore' icon={StrokeIpld}>Explore</NavLink>
      <NavLink to='/peers' icon={StrokeCube}>Peers</NavLink>
      <NavLink to='/settings' icon={StrokeSettings} disabled={!isSettingsEnabled}>Settings</NavLink>
    </nav>
  </div>
)

export const NavBarContainer = ({configRaw}) => {
  const isSettingsEnabled = !!configRaw.data
  return (
    <NavBar isSettingsEnabled={isSettingsEnabled} />
  )
}

export default connect('selectConfigRaw', NavBarContainer)
