import React from 'react'
import PropTypes from 'prop-types'
import './Radio.css'

const Radio = ({ className, label, disabled, checked, onChange, ...props }) => {
  className = `Radio dib sans-serif ${className}`
  if (!disabled) {
    className += ' pointer'
  }

  const change = (event) => {
    onChange(event.target.checked)
  }

  return (
    <label className={className} {...props}>
      <input className='absolute' type='checkbox' checked={checked} disabled={disabled} onChange={change} />
      <span className='dib v-mid br-100 w1 h1 pa1 border-box pointer'>
        <span className='db br-100 w-100 h-100 o-0 bg-aqua'/>
      </span>
      <span className='v-mid pl2'>
        {label}
      </span>
    </label>
  )
}

Radio.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func
}

Radio.defaultProps = {
  className: '',
  label: '',
  disabled: false,
  checked: null,
  onChange: () => {}
}

export default Radio
