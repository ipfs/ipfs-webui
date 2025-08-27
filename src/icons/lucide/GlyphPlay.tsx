import React from 'react'
import type { SVGProps } from 'react'
const SvgGlyphPlay = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        className="glyph_play_svg__lucide glyph_play_svg__lucide-play-icon glyph_play_svg__lucide-play"
        {...props}
    >
        <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
    </svg>
)
export default SvgGlyphPlay
