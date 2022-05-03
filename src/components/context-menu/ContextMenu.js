import React, { useRef, useState, useLayoutEffect, useEffect } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { DropdownMenu } from '@tableflip/react-dropdown'
import Portal from '../../helpers/Portal'
import RetroContainer from '../common/atoms/RetroContainer'

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
    const calculateCoordinates = () => {
      if (!target?.current) return
      const { top, left, width, height } = target.current.getBoundingClientRect()
      setCoordinates({ top, left, width, height })
    }

    calculateCoordinates()

    const event = window.addEventListener('scroll', () => {
      requestAnimationFrame(() => calculateCoordinates())
    })

    return () => window.removeEventListener('scroll', event)
  }, [target, visible])

  useEffect(() => {
    if (!target?.current) return

    const firstButton = target.current.querySelector('[role="menuitem"]')
    firstButton && firstButton.focus()
  }, [target, visible])

  if (!visible || !target || !target.current) return null

  return (
    <Portal id="portal-dropdown">
      <div className={ classNames('absolute', className) } style={{
        top: coordinates.top,
        left: coordinates.left
      }}>
        <DropdownMenu
          open={ visible }
          className='w95fa bg-near-purple'
          background={'#1d182c44'}
          width='auto'
          arrowHeight={0}
          top={coordinates.height}
          left={-coordinates.width}
          translateX={-coordinates.width}
          onDismiss={onDismiss}>
          <RetroContainer bgColor='#1d182c44' className='backdrop-filter'>
            <div className='flex flex-column' ref={containerRef} role="menu">
              {children}
            </div>
          </RetroContainer>
        </DropdownMenu>
      </div>
    </Portal>
  )
}

ContextMenu.propTypes = {
  arrowAlign: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  visible: PropTypes.bool,
  target: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  onDismiss: PropTypes.func,
  arrowMarginRight: PropTypes.number
}

ContextMenu.defaultProps = {
  arrowMarginRight: 13
}

export default ContextMenu
