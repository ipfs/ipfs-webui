import React from 'react'
import PropTypes from 'prop-types'
import CancelIcon from '../../icons/GlyphSmallCancel'

export const PromptActions = ({ className = '', children, ...props }) => (
  <div className={`flex justify-between pa2 ${className}`} style={{ backgroundColor: '#f4f6f8' }} {...props}>
    { children }
  </div>
)

export const PromptBody = ({ className, icon, title, children, ...props }) => {
  icon = React.createElement(icon, {
    className: 'fill-gray w3'
  })

  return (
    <div className={`ph2 pv3 tc ${className}`} {...props}>
      <div className='center bg-snow br-100 flex justify-center items-center' style={{width: '80px', height: '80px'}}>
        {icon}
      </div>

      <p className='charcoal-muted fw5'>{title}</p>

      {children}
    </div>
  )
}

PromptBody.propTypes = {
  icon: PropTypes.func.isRequired,
  title: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.node
  ])
}

PromptBody.defaultProps = {
  className: ''
}

export const Prompt = ({onCancel, children, className, ...props}) => {
  return (
    <div className={`${className} bg-white w-80 shadow-4 sans-serif relative`} style={{maxWidth: '30em'}} {...props}>
      { onCancel &&
        <CancelIcon className='absolute pointer w2 h2 top-0 right-0 fill-gray' onClick={onCancel} />
      }

      {children}
    </div>
  )
}

Prompt.propTypes = {
  onCancel: PropTypes.func
}

Prompt.defaultProps = {
  onCancel: null,
  className: ''
}

export default Prompt
