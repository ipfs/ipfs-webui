import React from 'react'

const GlyphSmallTick = ({ color = '#ECECEC', ...rest }) => (
  <svg width="12" height="12" viewBox="0 0 8 7" fill="#fff" {...rest}>
    <path d="M1 3L3 5L7 1" stroke={color} strokeWidth="2" />
  </svg>
)

export default GlyphSmallTick
