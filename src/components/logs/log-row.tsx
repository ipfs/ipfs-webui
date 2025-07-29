import React from 'react'
import type { LogEntry } from '../../contexts/logs/types'

interface LogRowProps {
  entry: LogEntry
  style?: React.CSSProperties
  formatTimestamp: (timestamp: string) => string
  getLevelColor: (level: string) => string
}

const LogRow: React.FC<LogRowProps> = ({ entry, style, formatTimestamp, getLevelColor }) => {
  return (
    <div
      style={style}
      className='flex mb1 lh-copy hover-bg-light-gray pa1 br1'
    >
      <span
        className='flex-none mr2 gray f7'
        style={{ minWidth: '90px' }}
        title={entry.timestamp}
      >
        {formatTimestamp(entry.timestamp)}
      </span>
      <span
        className='flex-none mr2 fw6 f7'
        style={{ minWidth: '60px', color: getLevelColor(entry.level) }}
      >
        {entry.level.toUpperCase()}
      </span>
      <span
        className='flex-none mr2 blue f7'
        style={{ minWidth: '120px' }}
        title={entry.subsystem}
      >
        {entry.subsystem}
      </span>
      <span className='flex-auto f7 pre-wrap'>
        {entry.message}
      </span>
    </div>
  )
}

export default LogRow
