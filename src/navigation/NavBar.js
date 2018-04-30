import React from 'react'
import { NavLink } from 'react-router-dom'

export default () => (
  <nav>
    <NavLink exact className='db pa1' activeClassName='active' to='/'>Status</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/files'>Files</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/ipld'>IPLD</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/peers'>Peers</NavLink>
    <NavLink className='db pa1' activeClassName='active' to='/settings'>Settings</NavLink>
  </nav>
)
