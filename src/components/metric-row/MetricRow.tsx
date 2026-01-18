import React from 'react'
import Tooltip from '../tooltip/Tooltip'

export const MetricRow: React.FC<{
  label: string
  value: React.ReactNode
  highlight?: boolean
  className?: string
  tooltip?: string
}> = ({ label, value, highlight = false, className = '', tooltip }) => {
  const labelNode = (
    <span className='f7 charcoal-muted'>{label}</span>
  )

  return (
    <div className={`flex justify-between items-center ${className}`}>
      {tooltip && (
        <Tooltip text={tooltip}>
          {labelNode}
        </Tooltip>
      )}

      {!tooltip && labelNode}

      <span className={`f6 ${highlight ? 'fw6 green' : ''}`}>
        {value}
      </span>
    </div>
  )
}

export default MetricRow
