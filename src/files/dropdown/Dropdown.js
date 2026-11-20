import React, { forwardRef } from 'react'
import { Dropdown as Drop, DropdownMenu as Menu } from '@tableflip/react-dropdown'
import StrokeCode from '../../icons/StrokeCode.js'

export const Option = ({ children, onClick, className = '', isCliTutorModeEnabled, onCliTutorMode, ...props }) => (
  isCliTutorModeEnabled
    ? <div className='flex items-center justify-between' style={{ transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
      <button role='menuitem' className={`pa2 pointer flex items-center flex-grow-1 ${className}`} onClick={onClick} {...props}>
        {children}
      </button>
      <button {...props} className={`pa2 pointer flex items-center ${className}`}>
        <StrokeCode {...props} onClick={() => onCliTutorMode(true)} className='dib pointer' style={{ height: 38, fill: 'var(--theme-text-link)' }}/>
      </button>
    </div>
    : <button role="menuitem" className={`pa2 pointer flex items-center ${className}`} onClick={onClick} {...props} style={{ transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
      {children}
    </button>
)

export const DropdownMenu = forwardRef((props, ref) => {
  const { children, arrowMarginRight, width = 200, translateX = 0, translateY = 0, ...rest } = props

  return (
    <Menu
      className='sans-serif br2'
      background='var(--theme-bg-inverted)'
      boxShadow='rgba(105, 196, 205, 0.5) 0px 1px 10px 0px'
      width={width}
      arrowAlign='right'
      arrowMarginRight={arrowMarginRight || '13px'}
      left={`calc(100% - ${width}px)`}
      translateX={translateX}
      translateY={translateY}
      {...rest}>
      <div className='flex flex-column' ref={ref} role="menu" style={{ color: 'var(--theme-text-primary)' }}>
        {children}
      </div>
    </Menu>
  )
})

export const Dropdown = Drop
