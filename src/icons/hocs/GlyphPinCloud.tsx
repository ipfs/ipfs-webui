import GlyphPinCloudRegular from '../GlyphPinCloud'
import GlyphPinCloudFailed from '../GlyphPinCloudFailed'

const GlyphPinCloud = ({ failed = false, ...props }) => failed
  ? <GlyphPinCloudFailed {...props} />
  : <GlyphPinCloudRegular {...props} />

export default GlyphPinCloud
