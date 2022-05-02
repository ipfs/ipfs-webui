import React from 'react'
import PropTypes from 'prop-types'

import RetroContainer from '../../components/common/atoms/RetroContainer'
import RetroButton from '../../components/common/atoms/RetroButton'
import CloseMark from '../../icons/retro/CloseMark'

export const ModalActions = ({ justify, className, children, ...props }) => (
  <div className={`flex justify-${justify} pb2 ${className} modalactions`} {...props} >
    {children}
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
  <div className={` ${className}`} {...props}>
    <p className='fw4 spacegrotesk-bold white fs16' style={{ marginBottom: 30 }}>{title}</p>
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

export const Modal = ({ ref, onCancel, children, className, ...props }) => {
  return (
    <div ref={ref} className={`${className} w-80 shadow-4 sans-serif relative backdrop-filter`} style={{ maxWidth: '35em' }} {...props}>
      <RetroContainer bgColor='transparent'>
        {onCancel &&
          <RetroButton
            flat
            height='44px'
            minHeight='44px'
            width='40px'
            onClick={onCancel}
            backgroundColor='#110D21'
            activeBgColor='#666'
            focusBgColor='transparent'
            style={{
              position: 'absolute',
              marginLeft: 'auto',
              marginRight: 'auto',
              top: '-20px',
              left: 'calc(50% - 14px)',
              border: '1px solid rgba(255, 255, 255, 0.2',
              borderRadius: '20px'
            }}>
            <CloseMark color='white' width={14} height={14} />
          </RetroButton>
        }

        {children}
      </RetroContainer>
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
