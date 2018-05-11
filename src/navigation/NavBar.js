import React from 'react'
import ipfsLogo from './ipfs-logo.svg'

const NavLink = ({
  to,
  children,
  className = 'db pv4 white tc link',
  activeClassName = 'bg-navy-muted'
}) => {
  const {hash} = window.location
  const href = `#${to}`
  const cls = hash === href ? className + ' ' + activeClassName : className
  return <a href={href} className={cls}>{children}</a>
}

export default () => (
  <div className='white pv3' style={{background: '#0E3A52', height: '100vh'}}>
    <img className='db center' style={{height: 70}} src={ipfsLogo} alt='IPFS' />
    <nav className='db pt4'>
      <NavLink to='/'>Status</NavLink>
      <NavLink to='/files'>Files</NavLink>
      <NavLink to='/ipld'>IPLD</NavLink>
      <NavLink to='/peers'>Peers</NavLink>
      <NavLink to='/settings'>Settings</NavLink>
    </nav>
  </div>
)
