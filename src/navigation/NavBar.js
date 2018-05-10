import React from 'react'

const NavLink = ({to, className, activeClassName, children}) => {
  const {hash} = window.location
  const href = `#${to}`
  const cls = hash === href ? className + ' ' + activeClassName : className
  return <a href={href} className={cls}>{children}</a>
}

export default () => (
  <nav>
    <NavLink exact className='db pa1' activeClassName='active' to='/'>Status</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/files'>Files</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/ipld'>IPLD</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/peers'>Peers</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/settings'>Settings</NavLink>
  </nav>
)
