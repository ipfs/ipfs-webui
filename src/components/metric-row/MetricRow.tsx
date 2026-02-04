import React from 'react'

export const MetricRow: React.FC<{
  label: string
  value: React.ReactNode
  highlight?: boolean
  className?: string
}> = ({ label, value, highlight = false, className = '' }) => {
  return (
    <div className={`flex justify-between items-center mb2 ${className}`}>
      <span className='f6'>
        {label}
      </span>

      <span className={`f6 ${highlight ? 'fw6 green' : ''}`}>
        {value}
      </span>
    </div>
  )
}

export default MetricRow
