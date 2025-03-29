import React, { forwardRef, useEffect } from 'react'
import { Dropdown as Drop, DropdownMenu as Menu } from '@tableflip/react-dropdown'
import StrokeCode from '../../icons/StrokeCode.js'

interface OptionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  isCliTutorModeEnabled?: boolean
  onCliTutorMode?: (value: boolean) => void
}

interface DropdownMenuProps {
  children: React.ReactNode
  arrowMarginRight?: string
  width?: number
  translateX?: number
  translateY?: number
  top?: number
  left?: string
  open?: boolean
  onDismiss?: () => void
}

interface MenuProps {
  boxShadow: string
  open: boolean
  className: string
  background: string
  width: number
  left: string
  onDismiss: () => void
  translateX?: number
  translateY?: number
  top?: number
  arrowHeight?: number
  arrowMarginLeft: string
  arrowMarginRight: string
  arrowAlign: 'left' | 'right'
  alignRight: boolean
  children: React.ReactNode
}

export const Option: React.FC<OptionProps> = ({ children, onClick, className = '', isCliTutorModeEnabled, onCliTutorMode, ...props }) => {
  return isCliTutorModeEnabled
    ? <div className='flex items-center justify-between'>
        <button role='menuitem' className={`bg-animate hover-bg-near-white pa2 pointer flex items-center flex-grow-1 ${className}`} onClick={onClick} {...props}>
          {children}
        </button>
        <button {...props} className={`bg-animate hover-bg-near-white pa2 pointer flex items-center ${className}`}>
          <StrokeCode {...props} onClick={() => onCliTutorMode?.(true)} className='dib fill-link pointer' style={{ height: 38 }}/>
        </button>
      </div>
    : <button role="menuitem" className={`bg-animate hover-bg-near-white pa2 pointer flex items-center ${className}`} onClick={onClick} {...props}>
        {children}
      </button>
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>((props, ref) => {
  const { children, arrowMarginRight, width = 200, translateX = 0, translateY = 0, ...rest } = props

  const disableContextMenu = (e: MouseEvent) => {
    e.preventDefault()
  }

  useEffect(() => {
    document.addEventListener('contextmenu', disableContextMenu)
    return () => {
      document.removeEventListener('contextmenu', disableContextMenu)
    }
  }, [])

  return (
    <Menu
      {...({
        className: 'sans-serif br2 charcoal',
        boxShadow: 'rgba(105, 196, 205, 0.5) 0px 1px 10px 0px',
        width,
        arrowAlign: 'right',
        background: 'white',
        arrowMarginRight: arrowMarginRight || '13px',
        left: `calc(100% - ${width}px)`,
        translateX,
        translateY,
        ...rest
      } as MenuProps)}>
      <div className='flex flex-column' ref={ref} role="menu">
        {children}
      </div>
    </Menu>
  )
})

export const Dropdown = Drop
