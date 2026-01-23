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
import { safeNumber, formatInteger } from './format-utils'

interface Props {
  sweep: SweepProvideStats
}

export const Queues: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')

  // Provide queue: pending key provides + pending region provides
  const provideQueue = safeNumber(sweep.queues?.pending_key_provides) + safeNumber(sweep.queues?.pending_region_provides)
  // Reprovide queue: pending region reprovides
  const reprovideQueue = safeNumber(sweep.queues?.pending_region_reprovides)

  const total = provideQueue + reprovideQueue

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>{t('dhtProvide.queues.title')}</CardTitle>
        <IconTooltip text={t('dhtProvide.queues.tooltip')} position='top'>
          <GlyphInfo className='fill-charcoal-muted o-50 pointer' style={{ width: 22, height: 22 }} />
        </IconTooltip>
      </CardHeader>
      <CardContent>
        <MetricRow label={t('dhtProvide.queues.provideQueue')} value={formatInteger(provideQueue)} />

        <MetricRow label={t('dhtProvide.queues.reprovideQueue')} value={formatInteger(reprovideQueue)} />

        <MetricRow label={t('dhtProvide.queues.total')} value={formatInteger(total)} />
      </CardContent>
    </Card>
  )
}
