import * as React from 'react'

/**
 * @param {React.SVGProps<SVGSVGElement>} props
 * @returns {React.ReactElement}
 */
function SvgGlyphPin (props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <path d="M41.72 58.28l-2.05-2.04-4.08 4.09-8.18 8.17-4.09 4.09-2.04 6.13 6.13-2.04 4.09-4.09 8.17-8.17 4.09-4.09-2.04-2.05z" />
      <path d="M78 43.51a1 1 0 00.45-1.64L68.28 31.72l-2-2-8.11-8.1a1 1 0 00-1.64.45 22.66 22.66 0 00-.88 5.64.89.89 0 01-.27.65L39.6 44.05a.93.93 0 01-.81.26 23.39 23.39 0 00-8.52.45 1 1 0 00-.44 1.64l11.89 11.88L53.6 70.17a1 1 0 001.64-.44 23.39 23.39 0 00.45-8.52.93.93 0 01.31-.81l15.69-15.74a.89.89 0 01.65-.27 22.66 22.66 0 005.66-.88z" />
    </svg>
  )
}

export default SvgGlyphPin
