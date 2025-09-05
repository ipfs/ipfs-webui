import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import classnames from 'classnames'
import ipfsLogoTextVert from './ipfs-logo-text-vert.svg'
import ipfsLogoTextHoriz from './ipfs-logo-text-horiz.svg'
import StrokeMarketing from '../icons/StrokeMarketing.js'
import StrokeWeb from '../icons/StrokeWeb.js'
import StrokeCube from '../icons/StrokeCube.js'
import StrokeSettings from '../icons/StrokeSettings.js'
import StrokeIpld from '../icons/StrokeIpld.js'
import StrokeLab from '../icons/StrokeLab.js'

// Styles
import './NavBar.css'

/**
 * @param {Object} props
 * @param {string} props.to
 * @param {React.ComponentType<React.SVGProps<SVGSVGElement>>} props.icon
 * @param {string} [props.alternative]
 * @param {boolean} [props.disabled]
 * @param {string} props.children
 */
const NavLink = ({
  to,
  icon,
  alternative,
  disabled,
  children
}) => {
  const Svg = icon
  const { hash } = window.location
  const href = `#${to}`
  const active = alternative
    ? hash === href || hash.startsWith(`${href}${alternative}`)
    : hash && hash.startsWith(href)
  const anchorClass = classnames({
    'bg-white-10 navbar-item-active': active,
    'o-50 no-pointer-events': disabled
  }, ['navbar-item dib db-l pt2 pb3 pv1-l white no-underline f5 hover-bg-white-10 tc bb bw2 bw0-l b--navy'])
  const svgClass = classnames({
    'o-100': active,
    'o-50': !active
  }, ['fill-current-color'])

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a href={disabled ? undefined : href} className={anchorClass} role='menuitem' title={children}>
      <div className='db ph2 pv1'>
        <div className='db'>
          <Svg width='46' role='presentation' className={svgClass} />
        </div>
        <div className={`${active ? 'o-100' : 'o-50'} db f6 tc montserrat ttu fw1 navbar-item-label`}>
          {children}
        </div>
      </div>
    </a>
  )
}

/**
 * @param {Object} props
 * @param {import('i18next').TFunction} props.t
 */
export const NavBar = ({ t }) => {
  const codeUrl = 'https://github.com/ipfs/ipfs-webui'
  const bugsUrl = `${codeUrl}/issues`
  const gitRevision = process.env.REACT_APP_GIT_REV
  const revisionUrl = `${codeUrl}/commit/${gitRevision}`
  return (
    <div className='h-100 fixed-l flex flex-column justify-between' style={{ overflowY: 'auto', width: 'inherit' }}>
      <div className='flex flex-column'>
        <a href="#/welcome" role='menuitem' title={t('welcome:description')}>
          <div className='pt3 pb1 pb2-l'>
            <img className='navbar-logo-vert center db-l dn pt3 pb1' style={{ height: 94 }} src={ipfsLogoTextVert} alt='' />
            <img className='navbar-logo-horiz center db dn-l' style={{ height: 70 }} src={ipfsLogoTextHoriz} alt='' />
          </div>
        </a>
        <div className='db overflow-x-scroll overflow-x-hidden-l nowrap tc' role='menubar'>
          <NavLink to='/' alternative="status" icon={StrokeMarketing}>{t('status:title')}</NavLink>
          <NavLink to='/files' icon={StrokeWeb}>{t('files:title')}</NavLink>
          <NavLink to='/explore' icon={StrokeIpld}>{t('explore:tabName')}</NavLink>
          <NavLink to='/peers' icon={StrokeCube}>{t('peers:title')}</NavLink>
          <NavLink to='/diagnostics' icon={StrokeLab}>{t('diagnostics:title')}</NavLink>
          <NavLink to='/settings' icon={StrokeSettings}>{t('settings:title')}</NavLink>
        </div>
      </div>
      <div className='dn db-l navbar-footer mb2 tc center f7 o-80 glow'>
        { gitRevision && <div className='mb1'>
          <a className='link white' href={revisionUrl} target='_blank' rel='noopener noreferrer'>{t('app:terms.revision')} {gitRevision}</a>
        </div> }
        <div className='mb1'>
          <a className='link white' href={codeUrl} target='_blank' rel='noopener noreferrer'>{t('app:nav.codeLink')}</a>
        </div>
        <div>
          <a className='link white' href={bugsUrl} target='_blank' rel='noopener noreferrer'>{t('app:nav.bugsLink')}</a>
        </div>
      </div>
    </div>
  )
}

export default connect(
  withTranslation()(NavBar)
)
