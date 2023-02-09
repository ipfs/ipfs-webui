import React from 'react'
import GlyphPinCloudRegular from '../GlyphPinCloud.js'
import GlyphPinCloudFailed from '../GlyphPinCloudFailed.js'

const GlyphPinCloud = ({ failed = false, ...props }) => failed
  ? <GlyphPinCloudFailed {...props} />
  : <GlyphPinCloudRegular {...props} />

export default GlyphPinCloud
