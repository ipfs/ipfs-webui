import React from 'react'
import type { SVGProps } from 'react'
const SvgGlyphExpand = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        className="glyph_expand_svg__lucide glyph_expand_svg__lucide-expand-icon glyph_expand_svg__lucide-expand"
        {...props}
    >
        <path d="m15 15 6 6M15 9l6-6M21 16v5h-5M21 8V3h-5M3 16v5h5M3 21l6-6M3 8V3h5M9 9 3 3" />
    </svg>
)
export default SvgGlyphExpand
