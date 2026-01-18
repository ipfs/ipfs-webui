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

export const QueueStatus: React.FC<Props> = ({ sweep }) => {
  const periodic = sweep.queues.pending_region_reprovides
  const onDemand = sweep.queues.pending_key_provides
  const regionProvides = sweep.queues.pending_region_provides

  const total = periodic + onDemand + regionProvides

  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue Status</CardTitle>
      </CardHeader>
      <CardContent>
        <MetricRow label='Periodic' value={periodic.toLocaleString()} />

        <MetricRow label='On-demand' value={onDemand.toLocaleString()} />

        <MetricRow label='Total' value={total.toLocaleString()} />
      </CardContent>
    </Card>
  )
}
