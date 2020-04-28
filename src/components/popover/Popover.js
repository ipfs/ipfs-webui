import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Popover.css'

const Popover = ({ show, children, top, right, bottom, left, align, handleMouseEnter, handleMouseLeave }) => {
  return (
    <div className={ classNames('popover absolute bg-white shadow-3', align && `popover--align-${align}`) }
      aria-hidden={ show ? 'false' : 'true' } style={{
        ...(top && { top }),
        ...(right && { right }),
        ...(bottom && { bottom }),
        ...(left && { left })
      }}
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
    >
      <div className="pa2">
        { children }
      </div>
    </div>
  )
}

Popover.propTypes = {
  show: PropTypes.bool,
  top: PropTypes.string,
  right: PropTypes.string,
  bottom: PropTypes.string,
  left: PropTypes.string,
  align: PropTypes.string,
  handleMouseEnter: PropTypes.func,
  handleMouseLeave: PropTypes.func
}

Popover.defaultProps = {
  show: false
}

export default Popover
