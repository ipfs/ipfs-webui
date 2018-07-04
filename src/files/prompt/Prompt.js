import React from 'react'
import PropTypes from 'prop-types'
import CancelIcon from '../../icons/GlyphSmallCancel'
import Button from '../../components/button/Button'

const GenericPrompt = ({onCancel, onConfirm, confirmText, title, icon, children, className, ...props}) => {
  icon = React.createElement(icon, {
    className: 'fill-gray w3'
  })

  return (
    <div className={`${className} bg-white w-80 shadow-4 sans-serif relative`} style={{maxWidth: '30em'}} {...props}>
      { onCancel &&
        <CancelIcon className='absolute pointer w2 h2 top-0 right-0 fill-gray' onClick={onCancel} />
      }

      <div className='ph2 pv3 tc'>
        <div className='center bg-snow br-100 flex justify-center items-center' style={{width: '80px', height: '80px'}}>
          {icon}
        </div>

        <p className='charcoal-muted fw5'>{title}</p>

        {children}
      </div>

      <div className='flex justify-between pa2' style={{ backgroundColor: '#f4f6f8' }}>
        { onCancel &&
          <Button className='ma2' bg='bg-gray' onClick={onCancel}>Cancel</Button>
        }
        <Button className='ma2' bg='bg-red' onClick={onConfirm}>{confirmText}</Button>
      </div>
    </div>
  )
}

GenericPrompt.propTypes = {
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  icon: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired
}

GenericPrompt.defaultProps = {
  onCancel: null,
  className: '',
  confirmText: 'OK'
}

export default GenericPrompt
