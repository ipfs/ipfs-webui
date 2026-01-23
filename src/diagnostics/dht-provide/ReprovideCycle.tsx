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

interface Props {
  sweep: SweepProvideStats
}

export const ReprovideCycle: React.FC<Props> = ({ sweep }) => {
  const { t } = useTranslation('diagnostics')
  const nsToMs = (ns: number) => ns / 1_000_000

  const totalMs = nsToMs(sweep.timing.reprovides_interval)
  const elapsedMs = nsToMs(sweep.timing.current_time_offset)

  const progress = Math.min(100, Math.round((elapsedMs / totalMs) * 100))
  const remainingMs = Math.max(0, totalMs - elapsedMs)

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const hrs = Math.floor(mins / 60)
    if (hrs > 0) return `${hrs}h ${mins % 60}m`
    return `${mins}m`
  }

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>
          {t('dhtProvide.reprovideCycle.title')} #{sweep.schedule.regions}
        </CardTitle>
        <IconTooltip text={t('dhtProvide.reprovideCycle.tooltip')} position='top'>
          <GlyphInfo className='fill-charcoal-muted o-50 pointer' style={{ width: 22, height: 22 }} />
        </IconTooltip>
      </CardHeader>

      <CardContent>
        {/* Progress bar + label (FULL WIDTH) */}
        <div className='flex items-center w-100 mb2'>
          <div className='bg-black-10 br2 overflow-hidden flex-auto mr2'>
            <div
              className='bg-teal-muted o-60'
              style={{
                width: `${progress}%`,
                height: 8
              }}
            />
          </div>
          <span className='f6 flex-none nowrap'>
            {t('dhtProvide.reprovideCycle.progress', { progress })}
          </span>
        </div>

        {/* Single info row */}
        <div className='f6'>
          {t('dhtProvide.reprovideCycle.summary', {
            elapsed: formatDuration(elapsedMs),
            eta: formatDuration(remainingMs),
            provided: sweep.operations.past.keys_provided.toLocaleString(),
            total: sweep.schedule.keys.toLocaleString()
          })}
        </div>
      </CardContent>
    </Card>

  )
}
