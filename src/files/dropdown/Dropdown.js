import React, { forwardRef } from 'react'
import { Dropdown as Drop, DropdownMenu as Menu } from '@tableflip/react-dropdown'
import StrokeCode from '../../icons/StrokeCode.js'

export const Option = ({ children, onClick, className = '', isCliTutorModeEnabled, onCliTutorMode, ...props }) => (
  isCliTutorModeEnabled
    ? <div className='flex items-center justify-between'>
      <button role='menuitem' className={`bg-animate hover-bg-near-white pa2 pointer flex items-center flex-grow-1 ${className}`} onClick={onClick} {...props}>
        {children}
      </button>
      <button {...props} className={`bg-animate hover-bg-near-white pa2 pointer flex items-center  ${className}`}>
        <StrokeCode {...props} onClick={() => onCliTutorMode(true)} className='dib fill-link pointer' style={{ height: 38 }}/>
      </button>
    </div>
    : <button role="menuitem" className={`bg-animate hover-bg-near-white pa2 pointer flex items-center ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
)

export const DropdownMenu = forwardRef((props, ref) => {
  const { children, arrowMarginRight, width = 200, translateX = 0, translateY = 0, ...rest } = props

  return (
    <Menu
      className='sans-serif br2 charcoal'
      boxShadow='rgba(105, 196, 205, 0.5) 0px 1px 10px 0px'
      width={width}
      arrowAlign='right'
      arrowMarginRight={arrowMarginRight || '13px'}
      left={`calc(100% - ${width}px)`}
      translateX={translateX}
      translateY={translateY}
      {...rest}>
      <div className='flex flex-column' ref={ref} role="menu">
        {children}
      </div>
    </Menu>
  )
})

export const Dropdown = Drop
