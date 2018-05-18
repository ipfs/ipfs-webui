import React from 'react'
import PropTypes from 'prop-types'
import Tick from '../../icons/GlyphSmallTick'
import './Checkbox.css'

import uniqueId from 'lodash.uniqueid'

const Checkbox = ({className = '', label = '', disabled = false, onChange, ...props}) => {
  const id = uniqueId('checkbox')
  className = `Checkbox sans-serif ${className}`

  const change = (event) => {
    onChange(event.target.checked)
  }

  return (
    <div className={className} {...props} >
      <input type='checkbox' disabled={disabled} id={id} onChange={change} />
      <label htmlFor={id} ><Tick className='w1 h1' fill='#69C4CD' viewBox='25 25 50 50' />{label}</label>
    </div>
  )
}

export default Checkbox
