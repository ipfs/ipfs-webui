import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import classnames from 'classnames'
import ipfsLogoText from './ipfs-logo-text-vert.svg'
import StrokeMarketing from '../icons/StrokeMarketing'
import StrokeWeb from '../icons/StrokeWeb'
import StrokeCube from '../icons/StrokeCube'
import StrokeSettings from '../icons/StrokeSettings'
import StrokeIpld from '../icons/StrokeIpld'

// Styles
import './NavBar.css'

const NavLink = ({
  to,
  icon,
  exact,
  disabled,
  children
}) => {
  const Svg = icon
  const { hash } = window.location
  const href = `#${to}`
  const active = exact ? hash === href : hash && hash.startsWith(href)
  const anchorClass = classnames({
    'bg-white-10': active,
    'o-50 no-pointer-events': disabled
  }, ['dib db-l pv3 white no-underline f5 hover-bg-white-10 tc'])
  const svgClass = classnames({
    'o-100': active,
    'o-50': !active
  }, ['fill-current-color'])

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a href={disabled ? null : href} className={anchorClass} style={{ borderLeft: active ? '5px solid rgba(201, 210, 215, .4)' : '' }} role='menuitem' title={children}>
      <div className='db ph2 pv1'>
        <div className='db'>
          <Svg width='50' className={svgClass} />
        </div>
        <div className={`${active ? 'o-100' : 'o-50'} db f6 tc montserrat ttu fw1 `}>
          {children}
        </div>
      </div>
    </a>
  )
}

export const NavBar = ({ t }) => {
  const codeUrl = 'https://github.com/ipfs-shipyard/ipfs-webui'
  const bugsUrl = `${codeUrl}/issues`
  const gitRevision = process.env.REACT_APP_GIT_REV
  const revisionUrl = `${codeUrl}/commit/${gitRevision}`
  return (
    <div className='h-100 fixed-l flex flex-column justify-between' style={{ overflowY: 'auto', width: 'inherit' }}>
      <div className='flex flex-column'>


        <div className='pointer navy pv3 pv4-l'>
          <img className='center db' style={{ height: 100 }} src={ipfsLogoText} alt='IPFS' />
        </div>

        <a href="#/welcome" role='menuitem' title="foo">
          <div className='db ph2 pv1'>
            <div className='db'>
              <img className='center db' style={{ height: 100 }} src={ipfsLogoText} alt='IPFS' />
            </div>
          </div>
        </a>


        <div className='db overflow-x-scroll overflow-x-hidden-l nowrap tc' role='menubar'>
          <NavLink to='/' exact icon={StrokeMarketing}>{t('status:title')}</NavLink>
          <NavLink to='/files' icon={StrokeWeb}>{t('files:title')}</NavLink>
          <NavLink to='/explore' icon={StrokeIpld}>{t('explore:tabName')}</NavLink>
          <NavLink to='/peers' icon={StrokeCube}>{t('peers:title')}</NavLink>
          <NavLink to='/settings' icon={StrokeSettings}>{t('settings:title')}</NavLink>
        </div>
      </div>
      <div className='dn db-l navbar-footer mb3 tc center f7 o-80 glow'>
        { gitRevision && <div className='mb1'>
          <a className='link white' href={revisionUrl} target='_blank' rel='noopener noreferrer'>{t('status:revision')} {gitRevision}</a>
        </div> }
        <div className='mb1'>
          <a className='link white' href={codeUrl} target='_blank' rel='noopener noreferrer'>{t('status:codeLink')}</a>
        </div>
        <div>
          <a className='link white' href={bugsUrl} target='_blank' rel='noopener noreferrer'>{t('status:bugsLink')}</a>
        </div>
      </div>
    </div>
  )
}

export const NavBarContainer = ({ ...props }) => {
  return (
    <NavBar
      {...props} />
  )
}

export default connect(
  withTranslation()(NavBarContainer)
)
