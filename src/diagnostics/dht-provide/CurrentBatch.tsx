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
        <CardTitle>Current Batch</CardTitle>
      </CardHeader>
      <CardContent>
        <MetricRow label='Region' value={region} />

        <MetricRow
          label='Batch'
          value={`${batchSize.toLocaleString()} CIDs`}
        />

        <MetricRow
          label='Progress'
          value={`${progress.toLocaleString()} / ${batchSize.toLocaleString()}`}
        />

        {ratePerSec != null && (
          <MetricRow label='Rate' value={`${ratePerSec} CIDs/sec`} />
        )}
      </CardContent>
    </Card>
  )
}
