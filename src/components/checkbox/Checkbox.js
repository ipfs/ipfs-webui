import React from 'react'
import PropTypes from 'prop-types'
import Tick from '../../icons/GlyphSmallTick'
import './Checkbox.css'

const Checkbox = ({ className, label, disabled, checked, onChange, color, ...props }) => {
  className = `Checkbox dib sans-serif ${className}`
  if (!disabled) {
    className += ' pointer'
  }

  const change = (event) => {
    onChange(event.target.checked)
  }

  return (
    <label className={'flex items-center ' + className} {...props}>
      <input className='absolute' type='checkbox' checked={checked} disabled={disabled} onChange={change} />
      <span
        className=' pointer flex items-center justify-center'
        style={{ background: checked ? 'white' : 'transparent', width: 16, height: 16 }}>
        {checked && (<Tick color={'#110d21'} />)}
      </span>
      <span className='ml2'>
        {label}
      </span>
    </label>
  )
}

Checkbox.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func
}

Checkbox.defaultProps = {
  className: '',
  label: '',
  disabled: false,
  checked: null,
  onChange: () => { }
}

export default Checkbox
