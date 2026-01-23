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
import { formatDuration, formatCount } from './format-utils'

interface Props {
  sweep: SweepProvideStats
}

export const Operations: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')

  // Ongoing provides: key_provides + region_provides
  const ongoingProvides = sweep.operations.ongoing.key_provides + sweep.operations.ongoing.region_provides
  // Ongoing reprovides: key_reprovides + region_reprovides
  const ongoingReprovides = sweep.operations.ongoing.key_reprovides + sweep.operations.ongoing.region_reprovides

  // Convert per-minute rates to per-second for display
  const provideRate = sweep.operations.past.keys_provided_per_minute != null
    ? (sweep.operations.past.keys_provided_per_minute / 60).toFixed(1)
    : null

  const reprovideRate = sweep.operations.past.keys_reprovided_per_minute != null
    ? (sweep.operations.past.keys_reprovided_per_minute / 60).toFixed(1)
    : null

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>{t('dhtProvide.operations.title')}</CardTitle>
        <IconTooltip text={t('dhtProvide.operations.tooltip')} position='top'>
          <GlyphInfo className='fill-charcoal-muted o-50 pointer' style={{ width: 22, height: 22 }} />
        </IconTooltip>
      </CardHeader>

      <CardContent>
        {/* Live stats: ongoing + rates */}
        <MetricRow
          label={t('dhtProvide.operations.ongoingProvides')}
          value={ongoingProvides.toLocaleString()}
        />

        <MetricRow
          label={t('dhtProvide.operations.ongoingReprovides')}
          value={formatCount(ongoingReprovides)}
        />

        {provideRate != null && (
          <MetricRow
            label={t('dhtProvide.operations.provideRate')}
            value={`${provideRate} CIDs/sec`}
          />
        )}

        {reprovideRate != null && (
          <MetricRow
            label={t('dhtProvide.operations.reprovideRate')}
            value={`${reprovideRate} CIDs/sec`}
          />
        )}

        {/* Cumulative stats */}
        <div className='mt3 pt3 bt b--black-10'>
          <MetricRow
            label={t('dhtProvide.operations.totalCidsProvided')}
            value={formatCount(sweep.operations.past.keys_provided)}
          />

          <MetricRow
            label={t('dhtProvide.operations.totalRecordsProvided')}
            value={formatCount(sweep.operations.past.records_provided)}
          />

          <MetricRow
            label={t('dhtProvide.operations.totalProvideErrors')}
            value={sweep.operations.past.keys_failed.toLocaleString()}
          />

          {sweep.operations.past.region_reprovide_duration != null && (
            <MetricRow
              label={t('dhtProvide.operations.regionReprovideDuration')}
              value={formatDuration(sweep.operations.past.region_reprovide_duration)}
            />
          )}

          {sweep.operations.past.avg_keys_per_reprovide != null && (
            <MetricRow
              label={t('dhtProvide.operations.avgCidsPerReprovide')}
              value={Math.round(sweep.operations.past.avg_keys_per_reprovide).toLocaleString()}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
