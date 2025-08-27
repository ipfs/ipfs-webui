import React from 'react'
import type { SVGProps } from 'react'
const SvgGlyphShrink = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        className="glyph_shrink_svg__lucide glyph_shrink_svg__lucide-shrink-icon glyph_shrink_svg__lucide-shrink"
        {...props}
    >
        <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8M9 19.8V15m0 0H4.2M9 15l-6 6M15 4.2V9m0 0h4.8M15 9l6-6M9 4.2V9m0 0H4.2M9 9 3 3" />
    </svg>
)
export default SvgGlyphShrink
