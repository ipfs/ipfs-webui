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

export const CurrentBatch: React.FC<Props> = ({ sweep }) => {
  const batchSize =
    sweep.schedule.regions > 0
      ? Math.ceil(sweep.schedule.keys / sweep.schedule.regions)
      : sweep.schedule.keys

  const provided = sweep.operations.past.keys_provided
  const progress = Math.min(provided, batchSize)

  const ratePerSec =
    sweep.operations.past.keys_provided_per_minute != null
      ? Math.round(sweep.operations.past.keys_provided_per_minute / 60)
      : null

  const region =
    sweep.schedule.next_reprovide_prefix || '(root)'

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center'>
          <CardTitle className='mr2'>Current Batch</CardTitle>
          <IconTooltip
            text={'Information about the currently processed batch: which region/prefix is being reprovided, the batch size, progress, and processing rate.'}
            position='top'
          >
            <GlyphInfo style={{ width: 14, height: 14, verticalAlign: 'middle' }} />
          </IconTooltip>
        </div>
      </CardHeader>
      <CardContent>
  <MetricRow label='Region' value={region} tooltip='Region/prefix currently being reprovided' />

        <MetricRow
          label='Batch'
          value={`${batchSize.toLocaleString()} CIDs`}
          tooltip='Approximate number of CIDs in the current batch'
        />

        <MetricRow
          label='Progress'
          value={`${progress.toLocaleString()} / ${batchSize.toLocaleString()}`}
          tooltip='Provided so far in the current batch'
        />

        {ratePerSec != null && (
          <MetricRow label='Rate' value={`${ratePerSec} CIDs/sec`} tooltip='Average processed CIDs per second' />
        )}
      </CardContent>
    </Card>
  )
}
