import React from 'react'
import './ProgressBar.css'

export interface ProgressBarProps {
  className?: string
  bg?: string
  width?: string
  height?: string
  br?: string
  time?: number
  progress?: number
  style?: React.CSSProperties
}

const ProgressBar: React.FC<ProgressBarProps> = ({ bg = 'bg-aqua', br = 'br-pill', className, style, width = 'w-100', height = 'h1', progress, time, ...props }) => {
  return (
    <div className={`ProgressBar sans-serif overflow-hidden ${br} dib ${className} ${width} ${height}`} style={{ background: '#DDE6EB', ...style }} {...props}>
      {time
        ? <div className={`${br} h-100 ${bg}`} style={{ animation: `progressBar ${time}s ease-in-out` }} />
        : <div className={`${br} h-100 ${bg}`} style={{ width: `${progress}%` }} />}
    </div>
  )
}

export default ProgressBar
