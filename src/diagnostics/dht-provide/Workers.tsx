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

export const Workers: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')
  const {
    max,
    active,
    active_periodic: activePeriodic,
    active_burst: activeBurst,
    dedicated_periodic: dedicatedPeriodic,
    dedicated_burst: dedicatedBurst,
    queued_periodic: queuedPeriodic,
    queued_burst: queuedBurst,
    max_provide_conns_per_worker: connsPerWorker
  } = sweep.workers

  const utilization = max > 0
    ? Math.round((active / max) * 100)
    : 0

  const periodicUtil =
    dedicatedPeriodic > 0 ? activePeriodic / dedicatedPeriodic : 0

  const burstUtil =
    dedicatedBurst > 0 ? activeBurst / dedicatedBurst : 0

  const Bar: React.FC<{ value: number }> = ({ value }) => (
    <div className='bg-black-10 br1 overflow-hidden w-100'>
      <div
        className='bg-teal-muted o-60'
        style={{ width: `${Math.min(100, value * 100)}%`, height: 6 }}
      />
    </div>
  )

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>{t('dhtProvide.workers.title')}</CardTitle>
        <IconTooltip text={t('dhtProvide.workers.tooltip')} position='top'>
          <GlyphInfo className='fill-charcoal-muted o-50 pointer' style={{ width: 22, height: 22 }} />
        </IconTooltip>
      </CardHeader>
      <CardContent>
        <div className='mb3'>
          <MetricRow
            label={t('dhtProvide.workers.active')}
            value={`${active} / ${max}`}
            highlight={utilization >= 75}
          />
          <div className='mt1'>
            <Bar value={utilization / 100} />
          </div>
        </div>

        <div className='mt3 pt3 bt b--black-10'>
          <div className='mb3'>
            <MetricRow
              label={t('dhtProvide.workers.periodic')}
              value={`${activePeriodic} / ${dedicatedPeriodic}`}
            />
            <div className='mt1'>
              <Bar value={periodicUtil} />
            </div>
          </div>

          <div className='mb3'>
            <MetricRow
              label={t('dhtProvide.workers.burst')}
              value={`${activeBurst} / ${dedicatedBurst}`}
            />
            <div className='mt1'>
              <Bar value={burstUtil} />
            </div>
          </div>

          {(queuedPeriodic > 0 || queuedBurst > 0) && (
            <MetricRow
              label={t('dhtProvide.workers.queued')}
              value={`${queuedPeriodic} / ${queuedBurst}`}
              highlight={queuedPeriodic + queuedBurst > 0}
            />
          )}
        </div>

        <div className='mt3 pt3 bt b--black-10'>
          <MetricRow
            label={t('dhtProvide.workers.maxConnsPerWorker')}
            value={connsPerWorker.toString()}
          />
        </div>
      </CardContent>
    </Card>
  )
}
