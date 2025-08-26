import React from 'react'
import './radio.css'

export interface RadioProps {
  className?: string
  label?: React.ReactNode
  disabled?: boolean
  checked?: boolean
  onChange: (checked: boolean) => void
}

const Radio: React.FC<RadioProps> = ({ className = '', label = '', disabled = false, checked = false, onChange = () => {}, ...props }) => {
  className = `Radio dib sans-serif ${className}`
  if (!disabled) {
    className += ' pointer'
  }

  const change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
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

export default Radio
