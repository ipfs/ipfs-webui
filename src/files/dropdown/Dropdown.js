import React, { forwardRef } from 'react'
import { Dropdown as Drop, DropdownMenu as Menu } from '@tableflip/react-dropdown'

import RetroContainer from '../../components/common/atoms/RetroContainer'
import './Dropdown.css'

import CLITutorIcon from '../../icons/retro/CLITutorIcon'

export const Option = ({ children, onClick, className = '', isCliTutorModeEnabled, onCliTutorMode, ...props }) => (
  isCliTutorModeEnabled
    ? <div className='flex items-center justify-between w95fa'>
      <button role='menuitem' className={`hover-bg-blue hover-white pa2 pl1 pr0 pointer flex items-center w95fa f7 retro-black flex-grow-1 ${className}`} onClick={onClick} {...props}>
        {children}
      </button>
      <button {...props} className={`hover-bg-blue retro-black hover-white pointer flex items-center ${className}`}>
        <CLITutorIcon {...props} onClick={() => onCliTutorMode(true)} className='dib  fill-current-color pointer' style={{ height: 24 }}/>
      </button>
    </div>
    : <button role="menuitem" className={`dropdown-item pa2 pl1 pointer flex items-center w95fa f7 retro-black spacegrotesk ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
)

export const DropdownMenu = forwardRef((props, ref) => {
  const { children, arrowMarginRight, width = 116, translateX = 0, translateY = 0, ...rest } = props

  return (
    <Menu
      className='spacegrotesk white context-menu-container'

      width={width}
      arrowAlign='left'
      arrowMarginRight={arrowMarginRight || '30px'}
      left={`calc(100% - ${width}px)`}
      translateX={translateX}
      translateY={translateY}
      {...rest}>
      <div ref={ref}>
        <RetroContainer className='flex flex-column' role="menu">
          {children}
        </RetroContainer>
      </div>
    </Menu>
  )
})

export const Dropdown = Drop
