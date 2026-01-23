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
import { formatDuration, formatElapsed, formatTime, formatCount, formatNumber, formatInteger, safeNumber, PLACEHOLDER } from './format-utils'

interface Props {
  sweep: SweepProvideStats
}

export const Schedule: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')

  const interval = safeNumber(sweep.timing?.reprovides_interval)
  const offset = safeNumber(sweep.timing?.current_time_offset)

  // Progress based on time elapsed in cycle
  const progress = interval > 0
    ? Math.min(100, Math.round((offset / interval) * 100))
    : 0

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
          label={t('dhtProvide.schedule.avgPrefixLength')}
          value={formatNumber(sweep.schedule?.avg_prefix_length, 1)}
        />

        <MetricRow
          label={t('dhtProvide.schedule.currentRegion')}
          value={<code className='f6 pa1 br2 bg-snow'>{sweep.schedule?.next_reprovide_prefix || PLACEHOLDER}</code>}
        />

        <MetricRow
          label={t('dhtProvide.schedule.nextReprovide')}
          value={formatTime(sweep.schedule?.next_reprovide_at)}
        />

        <div className='mt3 pt3 bt b--black-10'>
          <div className='bg-black-10 br1 overflow-hidden w-100'>
            <div
              className='bg-teal-muted o-60'
              style={{ width: `${progress}%`, height: 6 }}
            />
          </div>
          <div className='flex justify-between items-center mt2'>
            <span className='f6'>{elapsed} elapsed</span>
            <span className='f6'>{progress}%</span>
            <span className='f6'>{eta ? `${eta} remaining` : PLACEHOLDER}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
