import React from 'react'
import type { SVGProps } from 'react'
const SvgGlyphPause = (props: SVGProps<SVGSVGElement>) => (
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
        className="glyph_pause_svg__lucide glyph_pause_svg__lucide-pause-icon glyph_pause_svg__lucide-pause"
        {...props}
    >
        <rect width={5} height={18} x={14} y={3} rx={1} />
        <rect width={5} height={18} x={5} y={3} rx={1} />
    </svg>
)
export default SvgGlyphPause
