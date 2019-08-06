import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-overlays'

function Overlay ({ children, show, onLeave, className, ...props }) {
  const stopPropagation = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    if (e.key === 'Escape') {
      onLeave()
    }
  }

  const renderBackdrop = (props) => (
    <div className='fixed top-0 left-0 right-0 bottom-0 bg-black o-50' {...props} />
  )

  return (
    <Modal
      {...props}
      show={show}
      className={`${className} fixed top-0 left-0 right-0 bottom-0 z-max flex items-center justify-around`}
      renderBackdrop={renderBackdrop}
      onKeyDown={stopPropagation}
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
