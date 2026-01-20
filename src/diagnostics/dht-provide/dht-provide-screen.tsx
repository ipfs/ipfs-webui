import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useProvide } from '../../contexts/ProvideStat'
import './dht-provide.css'
import UnsupportedKuboVersion from 'src/components/unsupported-kubo-version/unsupported-kubo-version'
import { ReprovideCycle } from './ReprovideCycle'
import { CurrentBatch } from './CurrentBatch'
import { QueueStatus } from './QueueStatus'
import { Workers } from './Workers'
import { Network } from './Network'
import { GlyphAttention } from 'src/icons'

const DhtProvideScreen: React.FC = () => {
  const { t } = useTranslation('diagnostics')

  const {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    isAgentVersionSupported,
    autoRefreshEnabled,
    setAutoRefreshEnabled
  } = useProvide()

  const [secondsLeft, setSecondsLeft] = useState<number>(60)

  useEffect(() => {
    const tick = () => {
      if (!autoRefreshEnabled) {
        setSecondsLeft(0)
        return
      }

      if (!lastUpdated) {
        setSecondsLeft(60)
        return
      }

      const diff = Math.floor((Date.now() - lastUpdated) / 1000)
      const left = Math.max(0, 60 - (diff % 60))
      setSecondsLeft(left)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lastUpdated, autoRefreshEnabled])

  const sweep = data?.Sweep

  if (!isAgentVersionSupported) {
    return <UnsupportedKuboVersion />
  }

  if (loading && !data) {
    return <div className='pa4'>{t('dhtProvide.screen.loading')}</div>
  }

  if (error) {
    return (
      <div className='pa4 red'>
        {t('dhtProvide.screen.failedToLoad', { message: error.message })}
      </div>
    )
  }

  if (!sweep) {
    return (
      <div className='pa4'>
        {t('dhtProvide.screen.notEnabled')}
      </div>
    )
  }

  const workerUtilization =
    sweep.workers.max > 0
      ? sweep.workers.active / sweep.workers.max
      : 0

  return (
    <div className={'dht-provide ph4'}>
      <div className='dht-provide__header mb1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='f4 fw6 ma0'>
          {t('dhtProvide.screen.pageTitle')}
        </h2>

        <div className='dht-provide__controls'>
          <div className='dht-provide__control-box flex items-center gap-2'>
            <button
              className='btn'
              onClick={() => refresh()}
            >
              {t('dhtProvide.screen.refresh')}
            </button>

            <button
              className={`btn ${autoRefreshEnabled ? 'dht-provide__btn-auto-on' : 'dht-provide__btn-auto-off'}`}
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              title={autoRefreshEnabled ? t('dhtProvide.screen.autoOn') : t('dhtProvide.screen.autoOff')}
            >
              {autoRefreshEnabled ? t('dhtProvide.screen.autoOn') : t('dhtProvide.screen.autoOff')}
            </button>

            {autoRefreshEnabled && (
              <span className='f6 charcoal-muted min-w-[2.5rem] text-right'>
                {t('dhtProvide.screen.seconds', { seconds: secondsLeft })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='dht-provide__grid'>
        <div className='dht-provide__full'>
          <ReprovideCycle sweep={sweep} />
        </div>
        <CurrentBatch sweep={sweep} />
        <QueueStatus sweep={sweep} />

        <Workers sweep={sweep} />
        <Network sweep={sweep} />
      </div>

      {workerUtilization >= 0.75 && (
        <div className='dht-provide__warning mt4 flex items-start'>
          <GlyphAttention
            className='mr2 flex-shrink-0'
            style={{ width: 16, height: 16 }}
          />
          <div>
            {t('dhtProvide.screen.workersWarning', {
              percent: Math.round(workerUtilization * 100),
              max: sweep.workers.max
            })}
          </div>
        </div>
      )}
      {lastUpdated && (
        <div className='dht-provide__last-updated'>
          {t('dhtProvide.screen.lastUpdated', { time: new Date(lastUpdated).toLocaleTimeString() })}
        </div>
      )}
    </div>
  )
}

export default DhtProvideScreen
