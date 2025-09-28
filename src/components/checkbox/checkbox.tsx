import React from 'react'
import Tick from '../../icons/GlyphSmallTick.js'
import './Checkbox.css'

export interface CheckboxProps {
  className?: string
  label?: React.ReactNode
  disabled?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  style?: React.CSSProperties
}

const Checkbox: React.FC<CheckboxProps> = ({ className = '', label = '', disabled = false, checked = false, onChange, ...props }) => {
  className = `Checkbox dib sans-serif ${className}`
  if (!disabled) {
    className += ' pointer'
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked)
  }

  return (
    <label className={className} {...props}>
      <input className='absolute' type='checkbox' checked={checked} disabled={disabled} onChange={handleChange} />
      <span className='dib v-mid br1 w1 h1 pointer'>
        <Tick className='w1 h1 o-0 fill-aqua' viewBox='25 25 50 50' />
      </span>
      {Boolean(label) && <span className='v-mid pl2'>
        {label}
      </span>}
    </label>
  )
}

export default Checkbox
