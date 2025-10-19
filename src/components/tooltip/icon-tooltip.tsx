/**
 * A simple tooltip component for icons that displays text on hover.
 * Duplicates some of the code used in the Tooltip component.
 *
 * Example usage:
 * <IconTooltip text="Settings" position="top"><GlyphSettings /></IconTooltip>
 */

import React, { ReactElement, useState, useMemo } from 'react'
import './icon-tooltip.css'

interface IconTooltipProps {
  children: ReactElement
  text: string
  position: 'top' | 'bottom' | 'left' | 'right'
  forceShow?: boolean
}

const IconTooltip: React.FC<IconTooltipProps> = ({ children, text, position, forceShow = false }) => {
  const [show, setShow] = useState(false)

  const onMouseOver = () => setShow(true)
  const onMouseLeave = () => setShow(false)

  const tooltipStyles = useMemo<React.CSSProperties>(() => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
      wordWrap: 'break-word' as const,
      width: 'max-content' as const,
      maxWidth: '200px'
    }

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        }
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px'
        }
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '8px'
        }
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px'
        }
    }
  }, [position])

  const arrowStyles = useMemo<React.CSSProperties>(() => {
    const baseArrowStyles = {
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      zIndex: -1
    }

    switch (position) {
      case 'top':
        return {
          ...baseArrowStyles,
          top: '100%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          borderRadius: '2px 0px 0px'
        }
      case 'bottom':
        return {
          ...baseArrowStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translate(-50%, 50%) rotate(45deg)',
          borderRadius: '0px 0px 2px 0px'
        }
      case 'left':
        return {
          ...baseArrowStyles,
          left: '100%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          borderRadius: '0px 2px 0px 0px'
        }
      case 'right':
        return {
          ...baseArrowStyles,
          right: '100%',
          top: '50%',
          transform: 'translate(50%, -50%) rotate(45deg)',
          borderRadius: '0px 0px 0px 2px'
        }
    }
  }, [position])

  const tooltipDisplayClass = useMemo(() => (show || forceShow) ? 'db' : 'dn', [show, forceShow])

  return (
    <div className="relative" style={{ display: 'inline-block' }}>
      <div
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        onFocus={onMouseOver}
        onBlur={onMouseLeave}
      >
        {children}
      </div>
      <div
        style={tooltipStyles}
        className={`white z-max bg-navy-muted br2 pv2 ph3 f6 lh-copy fw5 absolute sans-serif noselect ${tooltipDisplayClass}`}
      >
        <div className='bg-navy-muted db bg-navy-muted absolute' style={arrowStyles} />
        {text}
      </div>
    </div>
  )
}

export default IconTooltip
