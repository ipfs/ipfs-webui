import React from 'react'
import { useTranslation } from 'react-i18next'
import IconTooltip from '../../components/tooltip/icon-tooltip'
import { GlyphInfo } from '../../icons'
import type { SweepProvideStats } from '../../contexts/ProvideStat/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '../../components/card/card'
import { MetricRow } from '../../components/metric-row/MetricRow'
import { formatDuration, formatCount, formatInteger, formatNumber, safeNumber } from './format-utils'

interface Props {
  sweep: SweepProvideStats
}

export const Operations: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')

  // Ongoing provides: key_provides + region_provides
  const ongoingProvides = safeNumber(sweep.operations?.ongoing?.key_provides) + safeNumber(sweep.operations?.ongoing?.region_provides)
  // Ongoing reprovides: key_reprovides + region_reprovides
  const ongoingReprovides = safeNumber(sweep.operations?.ongoing?.key_reprovides) + safeNumber(sweep.operations?.ongoing?.region_reprovides)

  const keysProvidedPerMin = sweep.operations?.past?.keys_provided_per_minute
  const provideRate = keysProvidedPerMin != null
    ? formatNumber(keysProvidedPerMin, 1)
    : null

  const keysReprovidedPerMin = sweep.operations?.past?.keys_reprovided_per_minute
  const reprovideRate = keysReprovidedPerMin != null
    ? formatNumber(keysReprovidedPerMin, 1)
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
          value={formatInteger(ongoingProvides)}
        />

        <MetricRow
          label={t('dhtProvide.operations.ongoingReprovides')}
          value={formatCount(ongoingReprovides)}
        />

        {provideRate != null && (
          <MetricRow
            label={t('dhtProvide.operations.provideRate')}
            value={`${provideRate} CIDs/min`}
          />
        )}

        {reprovideRate != null && (
          <MetricRow
            label={t('dhtProvide.operations.reprovideRate')}
            value={`${reprovideRate} CIDs/min`}
          />
        )}

        {/* Cumulative stats */}
        <div className='mt3 pt3 bt b--black-10'>
          <MetricRow
            label={t('dhtProvide.operations.totalCidsProvided')}
            value={formatCount(sweep.operations?.past?.keys_provided)}
          />

          <MetricRow
            label={t('dhtProvide.operations.totalRecordsProvided')}
            value={formatCount(sweep.operations?.past?.records_provided)}
          />

          <MetricRow
            label={t('dhtProvide.operations.totalProvideErrors')}
            value={formatInteger(safeNumber(sweep.operations?.past?.keys_failed))}
          />

          {sweep.operations?.past?.reprovide_duration != null && (
            <MetricRow
              label={t('dhtProvide.operations.regionReprovideDuration')}
              value={formatDuration(sweep.operations.past.reprovide_duration)}
            />
          )}

          {sweep.operations?.past?.avg_keys_per_reprovide != null && (
            <MetricRow
              label={t('dhtProvide.operations.avgCidsPerReprovide')}
              value={formatInteger(Math.round(sweep.operations.past.avg_keys_per_reprovide))}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
