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
import { formatDuration, formatElapsed, formatTime, formatCount } from './format-utils'

interface Props {
  sweep: SweepProvideStats
}

export const Schedule: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')

  // Progress based on time elapsed in cycle
  const progress = sweep.timing.reprovides_interval > 0
    ? Math.min(100, Math.round((sweep.timing.current_time_offset / sweep.timing.reprovides_interval) * 100))
    : 0

  // Calculate ETA
  const calculateEta = () => {
    if (sweep.timing.reprovides_interval <= 0) return null
    const remainingNs = sweep.timing.reprovides_interval - sweep.timing.current_time_offset
    if (remainingNs <= 0) return null
    return formatDuration(remainingNs)
  }

  const eta = calculateEta()
  const elapsed = formatElapsed(sweep.timing.cycle_start)

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
          value={formatDuration(sweep.timing.reprovides_interval)}
        />

        <MetricRow
          label={t('dhtProvide.schedule.cidsScheduled')}
          value={formatCount(sweep.schedule.keys)}
        />

        <MetricRow
          label={t('dhtProvide.schedule.regions')}
          value={
            sweep.operations.past.regions_reprovided_last_cycle != null
              ? `${sweep.schedule.regions.toLocaleString()} (${sweep.operations.past.regions_reprovided_last_cycle} last cycle)`
              : sweep.schedule.regions.toLocaleString()
          }
        />

        <MetricRow
          label={t('dhtProvide.schedule.avgPrefixLength')}
          value={sweep.schedule.avg_prefix_length.toFixed(1)}
        />

        <MetricRow
          label={t('dhtProvide.schedule.currentRegion')}
          value={<code className='f6 pa1 br2 bg-snow'>{sweep.schedule.next_reprovide_prefix || '-'}</code>}
        />

        <MetricRow
          label={t('dhtProvide.schedule.nextReprovide')}
          value={formatTime(sweep.schedule.next_reprovide_at)}
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
            <span className='f6'>{eta ? `${eta} remaining` : '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
