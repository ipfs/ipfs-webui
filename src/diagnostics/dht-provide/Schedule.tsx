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
import { formatDuration, formatElapsed, formatTime, formatCount, formatNumber, formatInteger, safeNumber, PLACEHOLDER } from './format-utils'

interface Props {
  sweep: SweepProvideStats
}

export const Schedule: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')

  const interval = safeNumber(sweep.timing?.reprovides_interval)
  const offset = safeNumber(sweep.timing?.current_time_offset)

  // Calculate ETA
  const calculateEta = () => {
    if (interval <= 0) return null
    const remainingNs = interval - offset
    if (remainingNs <= 0) return null
    return formatDuration(remainingNs)
  }

  const eta = calculateEta()
  const elapsed = formatElapsed(sweep.timing?.cycle_start)

  const regions = safeNumber(sweep.schedule?.regions)
  const lastCycleRegions = sweep.operations?.past?.regions_reprovided_last_cycle

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>{t('dhtProvide.schedule.title')}</CardTitle>
        <IconTooltip text={t('dhtProvide.schedule.tooltip')} position='top'>
          <GlyphInfo className='fill-charcoal-muted o-50 pointer' style={{ width: 22, height: 22 }} />
        </IconTooltip>
      </CardHeader>

      <CardContent>
        <MetricRow
          label={t('dhtProvide.schedule.reprovideInterval')}
          value={formatDuration(sweep.timing?.reprovides_interval)}
        />

        <MetricRow
          label={t('dhtProvide.schedule.elapsed')}
          value={elapsed}
        />

        <MetricRow
          label={t('dhtProvide.schedule.remaining')}
          value={eta ?? PLACEHOLDER}
        />

        <div className='mt3 pt3 bt b--black-10'>
          <MetricRow
            label={t('dhtProvide.schedule.cidsScheduled')}
            value={formatCount(sweep.schedule?.keys)}
          />

          <MetricRow
            label={t('dhtProvide.schedule.regions')}
            value={
              lastCycleRegions != null
                ? `${formatInteger(regions)} (${formatInteger(lastCycleRegions)} last cycle)`
                : formatInteger(regions)
            }
          />

          <MetricRow
            label={t('dhtProvide.schedule.avgCidsPerRegion')}
            value={regions > 0 ? formatCount(Math.ceil(safeNumber(sweep.schedule?.keys) / regions)) : PLACEHOLDER}
          />

          <MetricRow
            label={t('dhtProvide.schedule.avgPrefixLength')}
            value={formatNumber(sweep.schedule?.avg_prefix_length, 1)}
          />

          <MetricRow
            label={t('dhtProvide.schedule.nextRegionPrefix')}
            value={<code className='f6 pa1 br2 bg-snow'>{sweep.schedule?.next_reprovide_prefix || PLACEHOLDER}</code>}
          />

          <MetricRow
            label={t('dhtProvide.schedule.nextReprovide')}
            value={formatTime(sweep.schedule?.next_reprovide_at)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
