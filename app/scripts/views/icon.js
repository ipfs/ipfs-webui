import React, {PropTypes} from 'react'

function Icon ({glyph}) {
  return (
    <span
        className={`icon fa fa-${glyph}`}
        aria-hidden='true'
    >
    </span>
  )
}

Icon.propTypes = {
  glyph: PropTypes.string.isRequired
}

export default Icon
