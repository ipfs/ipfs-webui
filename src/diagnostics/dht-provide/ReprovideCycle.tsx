import React from 'react'
import IconTooltip from '../../components/tooltip/icon-tooltip'
import { GlyphInfo } from 'src/icons'
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
        <div className='flex items-center'>
          <CardTitle className='f5 mr2'>Reprovide Cycle</CardTitle>
          <IconTooltip
            text={'The reprovide cycle is the periodic sweep that reprovisions groups of CIDs to the DHT. This card shows the current cycle progress, how long ago it started, and an ETA for the next cycle.'}
            position='top'
          >
            <GlyphInfo style={{ width: 16, height: 16, verticalAlign: 'middle' }} />
          </IconTooltip>
        </div>
        <span className='f6 charcoal-muted'>Cycle #{sweep.schedule.regions}</span>
      </CardHeader>
      <CardContent>
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
