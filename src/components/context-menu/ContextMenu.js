import React, { useRef, useState, useLayoutEffect } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { DropdownMenu } from '@tableflip/react-dropdown'

/**
 * Shows a context menu with specified children elements relative to a target element
 *
 * Important: Child elements should contain role="listitem" to allow for better acessibiity
 * @component
 * @example
 * <ContextMenu>
 *  <button role="listitem">1</button>
 *  <button role="listitem" onClick={stuff}>2</button>
 * </ContextMenu>
 */
const ContextMenu = ({ className, children, target, visible, onDismiss }) => {
  const containerRef = useRef()
  const [coordinates, setCoordinates] = useState({})

  useLayoutEffect(() => {
    if (!containerRef?.current) return

    const { offsetTop, offsetLeft } = containerRef.current
    setCoordinates({ x: offsetLeft, y: offsetTop })
  }, [containerRef])
  if (!visible || !target || !target.current) return null

  return (
    <div className={ classNames('fixed', className) } style={{ zIndex: 1001 }}>
      <DropdownMenu
        open={ visible }
        className='sans-serif br2 charcoal'
        boxShadow='rgba(105, 196, 205, 0.5) 0px 1px 10px 0px'
        width='auto'
        arrowAlign='right'
        arrowMarginRight='13px'
        left='100%'
        translateX={coordinates.x}
        translateY={coordinates.y}
        onDismiss={ () => onDismiss() }>
        <div className='flex flex-column' ref={containerRef} role="menu">
          {children}
        </div>
      </DropdownMenu>
    </div>
  )
}

ContextMenu.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  visible: PropTypes.bool,
  target: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  onDismiss: PropTypes.func
}

export default ContextMenu
