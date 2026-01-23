import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('diagnostics')
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
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>{t('dhtProvide.currentBatch.title')}</CardTitle>
        <IconTooltip text={t('dhtProvide.currentBatch.tooltip')} position='top'>
          <GlyphInfo className='fill-charcoal-muted o-50 pointer' style={{ width: 22, height: 22 }} />
        </IconTooltip>
      </CardHeader>
      <CardContent>
        <MetricRow label={t('dhtProvide.currentBatch.region')} value={region} />
        <MetricRow
          label={t('dhtProvide.currentBatch.batch')}
          value={`${batchSize.toLocaleString()} CIDs`}
        />
        <MetricRow
          label={t('dhtProvide.currentBatch.progress')}
          value={`${progress.toLocaleString()} / ${batchSize.toLocaleString()}`}
        />
        {ratePerSec != null && (
          <MetricRow label={t('dhtProvide.currentBatch.rate')} value={`${ratePerSec} CIDs/sec`} />
        )}
      </CardContent>
    </Card>
  )
}
