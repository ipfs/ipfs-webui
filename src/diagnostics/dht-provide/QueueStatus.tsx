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

export const QueueStatus: React.FC<Props> = ({ sweep }) => {
  const periodic = sweep.queues.pending_region_reprovides
  const onDemand = sweep.queues.pending_key_provides
  const regionProvides = sweep.queues.pending_region_provides

  const total = periodic + onDemand + regionProvides

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center'>
          <CardTitle className='mr2'>Queue Status</CardTitle>
          <IconTooltip
            text={'Shows pending reprovides broken into periodic (scheduled), on-demand, and region-specific queues.'}
            position='top'
          >
            <GlyphInfo style={{ width: 14, height: 14 }} />
          </IconTooltip>
        </div>
      </CardHeader>
      <CardContent>
        <MetricRow label='Periodic' value={periodic.toLocaleString()} />

        <MetricRow label='On-demand' value={onDemand.toLocaleString()} />

        <MetricRow label='Total' value={total.toLocaleString()} />
      </CardContent>
    </Card>
  )
}
