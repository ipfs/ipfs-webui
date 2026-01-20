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
    dedicated_burst: dedicatedBurst
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
        className='bg-blue'
        style={{ width: `${Math.min(100, value * 100)}%`, height: 6 }}
      />
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center'>
          <CardTitle className='mr2'>{t('dhtProvide.workers.title')}</CardTitle>
          <IconTooltip
            text={t('dhtProvide.workers.tooltip')}
            position='top'
          >
            <GlyphInfo style={{ width: 14, height: 14 }} />
          </IconTooltip>
        </div>
      </CardHeader>
      <CardContent>
        <MetricRow
          label={t('dhtProvide.workers.active')}
          value={`${active}/${max} (${utilization}%)`}
          highlight={utilization >= 75}
        />

        <div className='mt2 mb2'>
          <MetricRow
            label={t('dhtProvide.workers.periodic')}
            value={`${activePeriodic}/${dedicatedPeriodic}`}
          />
          <div className='mt2'>
            <Bar value={periodicUtil} />
          </div>
        </div>

        <div>
          <MetricRow
            label={t('dhtProvide.workers.onDemand')}
            value={`${activeBurst}/${dedicatedBurst}`}
          />
          <div className='mt2'>
            <Bar value={burstUtil} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
