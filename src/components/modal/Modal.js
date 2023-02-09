import React from 'react'
import PropTypes from 'prop-types'
import CancelIcon from '../../icons/GlyphSmallCancel.js'

export const ModalActions = ({ justify, className, children, ...props }) => (
  <div className={`flex justify-${justify} pa2 ${className}`} style={{ backgroundColor: '#f4f6f8' }} {...props}>
    { children }
  </div>
)

ModalActions.propTypes = {
  justify: PropTypes.string,
  className: PropTypes.string
}

ModalActions.defaultProps = {
  justify: 'between',
  className: ''
}

export const ModalBody = ({ className, Icon, title, children, ...props }) => (
  <div className={`ph4 pv3 tc ${className}`} {...props}>
    { Icon && (
      <div className='center bg-snow br-100 flex justify-center items-center' style={{ width: '80px', height: '80px' }}>
        {<Icon className='fill-gray w3'/>}
      </div>
    )}

    <p className='charcoal fw6 truncate'>{title}</p>

    {children}
  </div>
)

ModalBody.propTypes = {
  Icon: PropTypes.func,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ])
}

ModalBody.defaultProps = {
  className: ''
}

export const Modal = ({ onCancel, children, className, ...props }) => {
  return (
    <div className={`${className} bg-white w-80 shadow-4 sans-serif relative`} style={{ maxWidth: '34em' }} {...props}>
      { onCancel &&
        <CancelIcon className='absolute pointer w2 h2 top-0 right-0 fill-gray' onClick={onCancel} />
      }

      {children}
    </div>
  )
}

Modal.propTypes = {
  onCancel: PropTypes.func
}

Modal.defaultProps = {
  onCancel: null,
  className: ''
}

export default Modal
