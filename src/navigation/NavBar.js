import React from 'react'
import ipfsLogo from './ipfs-logo.svg'

const NavLink = ({
  to,
  children,
  className = 'db pv4 white tc link focus-outline',
  activeClassName = 'bg-navy-muted'
}) => {
  const {hash} = window.location
  const href = `#${to}`
  const cls = hash === href ? className + ' ' + activeClassName : className
  return <a href={href} className={cls} role='menuitem'>{children}</a>
}

export default () => (
  <div className='white pv3'>
    <a href='#/' className='db'>
      <img className='db center' style={{height: 70}} src={ipfsLogo} alt='IPFS' />
    </a>
    <nav className='db pt4' role='menubar'>
      <NavLink to='/'>Status</NavLink>
      <NavLink to='/files'>Files</NavLink>
      <NavLink to='/ipld'>IPLD</NavLink>
      <NavLink to='/peers'>Peers</NavLink>
      <NavLink to='/settings'>Settings</NavLink>
    </nav>
  </div>
)
