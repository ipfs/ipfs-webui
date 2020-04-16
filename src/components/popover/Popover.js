import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Popover.css'

const Popover = ({ show, children, top, right, bottom, left, align }) => {
  return (
    <div className={ classNames('popover absolute bg-white', align && `popover--align-${align}`) }
      aria-hidden={ show ? 'false' : 'true' } style={{
        ...(top && { top }),
        ...(right && { right }),
        ...(bottom && { bottom }),
        ...(left && { left })
      }}>
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
  align: PropTypes.string
}

Popover.defaultProps = {
  show: false
}

export default Popover
