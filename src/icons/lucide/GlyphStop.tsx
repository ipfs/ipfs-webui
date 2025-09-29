import React from 'react'
import type { SVGProps } from 'react'
const SvgGlyphStop = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        className="glyph_stop_svg__lucide glyph_stop_svg__lucide-square-icon glyph_stop_svg__lucide-square"
        {...props}
    >
        <rect width={18} height={18} x={3} y={3} rx={2} />
    </svg>
)
export default SvgGlyphStop
