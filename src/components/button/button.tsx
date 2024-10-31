import React from 'react'
import './Button.css'
import classNames from 'classnames'
import PropTypes from 'prop-types'

const getButtonClassName = ({ fill, bg, color, danger, disabled }, type) => {
  if (danger) return 'bg-red fill-white white'
  if (disabled) return 'bg-gray-muted fill-snow light-gray'
  if (type === 'link') return 'link bg-transparent'
  return `${fill} ${bg} ${color}`
}

const Button = ({ className, minWidth, children, style, type, danger, ...props }) =>
  <button type={type} className={classNames('Button transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 pa2 focus-outline', className, getButtonClassName(props, type))} disabled={props.disabled} style={{ minWidth, ...style }} {...props}>
    {children}
  </button>

Button.defaultProps = {
  bg: 'bg-teal',
  color: 'white',
  fill: 'white',
  className: '',
  minWidth: 140
}

Button.propTypes = {
  danger: PropTypes.bool,
  disabled: PropTypes.bool
}

export default Button
