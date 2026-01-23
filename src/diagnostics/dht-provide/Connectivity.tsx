import React from 'react'
import { useTranslation } from 'react-i18next'
import IconTooltip from '../../components/tooltip/icon-tooltip'
import { GlyphInfo, GlyphTick, GlyphCancel } from 'src/icons'
import type { SweepProvideStats } from '../../contexts/ProvideStat/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '../../components/card/card'
import { MetricRow } from '../../components/metric-row/MetricRow'
import { formatDuration, formatSince } from './format-utils'

interface Props {
  sweep: SweepProvideStats
}

export const Connectivity: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')
  const connected = sweep.connectivity?.status === 'online'
  const since = formatSince(sweep.connectivity?.since, t)

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>{t('dhtProvide.connectivity.title')}</CardTitle>
        <IconTooltip text={t('dhtProvide.connectivity.tooltip')} position='top'>
          <GlyphInfo className='fill-charcoal-muted o-50 pointer' style={{ width: 22, height: 22 }} />
        </IconTooltip>
      </CardHeader>

      <CardContent>
        <div className='flex items-center justify-between mb2'>
          <span className='f6'>{t('dhtProvide.connectivity.status')}</span>
          <span className='flex items-center'>
            <span
              className={`dib br-100 mr2 ${connected ? 'bg-green' : 'bg-red'}`}
              style={{ width: 8, height: 8 }}
            />
            <span className='f6 fw5'>
              {connected ? t('dhtProvide.connectivity.online') : t('dhtProvide.connectivity.offline')}
              {since && (
                <span className='fw4 ml1 charcoal-muted'>({since})</span>
              )}
            </span>
          </span>
        </div>

        <MetricRow
          label={t('dhtProvide.connectivity.uptime')}
          value={formatDuration(sweep.timing?.uptime)}
        />

        <div className='flex items-center justify-between mb2'>
          <span className='f6'>{t('dhtProvide.connectivity.keyspaceCoverage')}</span>
          <span className='flex items-center f6'>
            {sweep.network?.complete_keyspace_coverage
              ? (
                <>
                  <GlyphTick className='fill-green mr1' style={{ width: 14, height: 14 }} />
                  <span className='green fw5'>{t('dhtProvide.connectivity.full')}</span>
                </>
                )
              : (
                <>
                  <GlyphCancel className='fill-yellow mr1' style={{ width: 14, height: 14 }} />
                  <span className='yellow fw5'>{t('dhtProvide.connectivity.partial')}</span>
                </>
                )}
          </span>
        </div>

        {sweep.closed && (
          <div className='mt2 pa2 br2 bg-washed-red dark-red f7'>
            {t('dhtProvide.connectivity.closedWarning')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
