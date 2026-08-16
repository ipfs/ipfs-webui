import React from 'react'
import './button.css'
import classNames from 'classnames'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  minWidth?: number
  children: React.ReactNode | React.ReactNode[]
  type?: 'link'
  buttonType?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
  danger?: boolean
  fill?: string
  bg?: string
  color?: string
}

const getButtonClassName = ({ fill, bg, color, danger, disabled }: Pick<ButtonProps, 'fill' | 'bg' | 'color' | 'danger' | 'disabled'>, type: ButtonProps['type']) => {
  if (danger) return 'bg-red fill-white white'
  if (disabled) return 'bg-gray-muted fill-snow light-gray'
  if (type === 'link') return 'link bg-transparent'
  return `${fill} ${bg} ${color}`
}

const defaultProps: Partial<ButtonProps> = {
  bg: 'bg-teal',
  color: 'white',
  fill: 'white',
  className: '',
  minWidth: 140
}

const Button: React.FC<ButtonProps> = (givenProps) => {
  const { className, minWidth, children, style, buttonType, type, danger, ...props } = { ...defaultProps, ...givenProps }
  return (
    <button type={buttonType} className={classNames('Button transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 pa2 focus-outline', className, getButtonClassName(props, type))} disabled={props.disabled} style={{ minWidth, ...style }} {...props}>
      {children}
    </button>
  )
}

export default Button
