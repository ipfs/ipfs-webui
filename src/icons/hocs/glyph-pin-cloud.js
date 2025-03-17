import React from 'react'
import GlyphPinCloudRegular from '../glyph-pin-cloud.js'
import GlyphPinCloudFailed from '../glyph-pin-cloud-failed.js'

const GlyphPinCloud = ({ failed = false, ...props }) => failed
  ? <GlyphPinCloudFailed {...props} />
  : <GlyphPinCloudRegular {...props} />

export default GlyphPinCloud
