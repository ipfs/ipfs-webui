import React from 'react'
import PropTypes from 'prop-types'
import Tick from '../../icons/GlyphSmallTick.js'
import './Checkbox.css'

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.label]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.checked]
 * @param {function(boolean): void} props.onChange
 * @returns {React.ReactElement}
 */
const Checkbox = ({ className, label, disabled, checked, onChange, ...props }) => {
  className = `Checkbox dib sans-serif ${className}`
  if (!disabled) {
    className += ' pointer'
  }

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const change = (event) => {
    onChange(event.target.checked)
  }

  return (
    <label className={className} {...props}>
      <input className='absolute' type='checkbox' checked={checked} disabled={disabled} onChange={change} />
      <span className='dib v-mid br1 w1 h1 pointer'>
        <Tick className='w1 h1 o-0 fill-aqua' viewBox='25 25 50 50' />
      </span>
      {Boolean(label) && <span className='v-mid pl2'>
        {label}
      </span>}
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
  onChange: () => {}
}

export default Checkbox
