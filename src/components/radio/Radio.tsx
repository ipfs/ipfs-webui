import React from 'react'

interface RadioProps {
  className?: string
  label?: React.ReactNode
  disabled?: boolean
  checked?: boolean | null
  onChange?: (checked: boolean) => void
}

const Radio: React.FC<RadioProps> = ({
  className = '',
  label = '',
  disabled = false,
  checked = null,
  onChange = () => {},
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked)
  }

  return (
    <label
      className={`inline-block font-sans ${className} ${
        !disabled ? 'cursor-pointer' : ''
      }`}
      {...props}
    >
      <input
        className='absolute'
        type='checkbox'
        checked={checked ?? false}
        disabled={disabled}
        onChange={handleChange}
        aria-checked={checked ?? false}
        aria-disabled={disabled}
        role='radio'
      />
      <span className='inline-block align-middle rounded-full w-4 h-4 p-1 border-box cursor-pointer'>
        <span className='block rounded-full w-full h-full opacity-0 bg-aqua' />
      </span>
      <span className='align-middle pl-2'>{label}</span>
    </label>
  )
}

export default Radio
