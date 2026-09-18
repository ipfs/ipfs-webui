import * as React from 'react'

function StrokeMonitor (props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      {/* Monitor screen */}
      <rect
        x={15}
        y={20}
        width={70}
        height={45}
        rx={3}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
      />
      {/* Monitor stand */}
      <line
        x1={50}
        y1={65}
        x2={50}
        y2={75}
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Monitor base */}
      <line
        x1={35}
        y1={75}
        x2={65}
        y2={75}
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default StrokeMonitor
