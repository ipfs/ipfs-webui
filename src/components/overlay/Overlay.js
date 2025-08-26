import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-overlays'

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} props.show
 * @param {() => void} props.onLeave
 * @param {string} props.className
 * @param {boolean} props.hidden
 * @returns {JSX.Element}
 */
function Overlay ({ children, show, onLeave, className, hidden, ...props }) {
  /**
   * @type {React.KeyboardEventHandler<HTMLDivElement>}
   */
  const handleEscapeKeyDown = (e) => {
    e.stopPropagation()

    onLeave()
  }

  /**
   * @type {React.FC<React.HTMLAttributes<HTMLDivElement>>}
   */
  const renderBackdrop = (props) => (
    <div className='fixed top-0 left-0 right-0 bottom-0 bg-black o-50' hidden={hidden} {...props} />
  )

  return (
    <Modal
      {...props}
      show={show}
      className={`${className} fixed top-0 left-0 right-0 bottom-0 z-max flex items-center justify-around`}
      renderBackdrop={renderBackdrop}
      onEscapeKeyDown={handleEscapeKeyDown}
      onBackdropClick={onLeave}>
      {children}
    </Modal>
  )
}

Overlay.propTypes = {
  show: PropTypes.bool.isRequired,
  onLeave: PropTypes.func.isRequired
}

Overlay.defaultProps = {
  className: ''
}

export default Overlay
