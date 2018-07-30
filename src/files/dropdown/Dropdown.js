import React from 'react'
import {Dropdown as Drop, DropdownMenu as Menu} from '@tableflip/react-dropdown'

export const Option = ({children, onClick, className = '', ...props}) => (
  <a className={`bg-animate hover-bg-near-white pa2 pointer flex items-center ${className}`} onClick={onClick} {...props}>
    {children}
  </a>
)

export const DropdownMenu = ({children, arrowMarginRight, width = 200, ...props}) => (
  <Menu
    className='sans-serif br2 charcoal'
    boxShadow='rgba(105, 196, 205, 0.5) 0px 1px 10px 0px'
    width={width}
    arrowAlign='right'
    arrowMarginRight={arrowMarginRight || '13px'}
    left={`calc(100% - ${width}px)`}
    {...props} >
    <nav className='flex flex-column'>
      {children}
    </nav>
  </Menu>
)

export const Dropdown = Drop
