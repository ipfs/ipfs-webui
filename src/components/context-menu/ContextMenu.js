import React, { useRef, useState, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'

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
const ContextMenu = ({ children, target, visible }) => {
  const containerRef = useRef()
  const [coordinates, setCoordinates] = useState({})

  useLayoutEffect(() => {
    if (!containerRef?.current) return

    const { offsetTop, offsetLeft } = containerRef.current
    setCoordinates({ x: offsetLeft, y: offsetTop })
  }, [containerRef])
  if (!visible || !target || !target.current) return null

  return (
    <div className='flex flex-column' ref={containerRef} role="menu" style={{ left: coordinates.x, top: coordinates.y }}>
      {children}
    </div>
  )
}

ContextMenu.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  visible: PropTypes.bool,
  target: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
}

export default ContextMenu
