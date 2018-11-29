import React from 'react'
import SelectReact from 'react-select';
import PropTypes from 'prop-types'
import './Select.css'

const Select = ({ className, label, disabled, value, onChange, options, ...props }) => {
  className = `Select dib sans-serif ${className}`

  return (
    <label className={className} {...props}>
      <SelectReact
        className='absolute'
        type='select'
        options={options}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
      <span className='v-mid'>{label}</span>
    </label>
  )
}

Select.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func
}

Select.defaultProps = {
  className: '',
  label: '',
  disabled: false,
  value: null,
  onChange: () => {}
}

export default Select
