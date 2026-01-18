import React from 'react'
import type { SweepProvideStats } from '../../contexts/ProvideStat/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '../../components/card/card'
import { MetricRow } from '../../components/metric-row/MetricRow'

interface Props {
  sweep: SweepProvideStats
}

export const ReprovideCycle: React.FC<Props> = ({ sweep }) => {
  const nsToMs = (ns: number) => ns / 1_000_000

  const totalMs = nsToMs(sweep.timing.reprovides_interval)
  const elapsedMs = nsToMs(sweep.timing.current_time_offset)

  const progress = Math.min(100, Math.round((elapsedMs / totalMs) * 100))
  const remainingMs = Math.max(0, totalMs - elapsedMs)

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const hrs = Math.floor(mins / 60)
    if (hrs > 0) return `${hrs}h ${mins % 60}m`
    return `${mins}m`
  }

  return (
    <Card className='mb4'>
      <CardHeader className='flex justify-between items-center pb2'>
        <CardTitle className='f5'>Reprovide Cycle</CardTitle>
        <span className='f6 charcoal-muted'>Cycle #{sweep.schedule.regions}</span>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className='bg-near-white br2 overflow-hidden mb2'>
          <div
            className='bg-green'
            style={{ width: `${progress}%`, height: '8px' }}
          />
        </div>

        <div className='flex justify-between f6 charcoal-muted mb2'>
          <span>{progress}% complete</span>
          <span>
            Started {formatDuration(elapsedMs)} ago • ETA {formatDuration(remainingMs)}
          </span>
        </div>

        <div className='mt1'>
          <MetricRow
            label='Provided'
            value={`${sweep.operations.past.keys_provided.toLocaleString()} / ${sweep.schedule.keys.toLocaleString()} CIDs`}
          />
        </div>
      </CardContent>
    </Card>
  )
}
