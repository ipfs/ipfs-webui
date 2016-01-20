import React, {PropTypes} from 'react'
import classNames from 'classnames'

function Icon ({glyph, large = false}) {
  const className = classNames('icon', 'fa', `fa-${glyph}`, {
    'fa-lg': large
  })

  return (
    <span className={className} aria-hidden='true'>
    </span>
  )
}

Icon.propTypes = {
  glyph: PropTypes.string.isRequired,
  large: PropTypes.bool
}

export default Icon
