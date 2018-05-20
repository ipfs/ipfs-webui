import React from 'react'
import PropTypes from 'prop-types'
import Tick from '../../icons/GlyphSmallTick'
import './Checkbox.css'

const Checkbox = ({className, label, disabled, checked, onChange, ...props}) => {
  className = `Checkbox pointer dib sans-serif ${className}`

  const change = (event) => {
    onChange(event.target.checked)
  }

  return (
    <label className={className} {...props}>
      <input className='absolute o-0' type='checkbox' checked={checked} disabled={disabled} onChange={change} />
      <span className='dib v-mid br1 w1 h1 mr1'>
        <Tick className='w1 h1 o-0 fill-aqua' viewBox='25 25 50 50' />
      </span>
      <span className='v-mid'>{label}</span>
    </label>
  )
}

Checkbox.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired
}

Checkbox.defaultProps = {
  className: '',
  label: '',
  disabled: false,
  checked: null
}

export default Checkbox
