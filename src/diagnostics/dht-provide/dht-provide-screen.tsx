import React, { useEffect, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'

import { useProvide } from '../../contexts/ProvideStat'
import './dht-provide.css'
import UnsupportedKuboVersion from '../../components/unsupported-kubo-version/unsupported-kubo-version'
import { Connectivity } from './Connectivity'
import { Queues } from './Queues'
import { Schedule } from './Schedule'
import { Operations } from './Operations'
import { Network } from './Network'
import { Workers } from './Workers'
import { GlyphAttention } from '../../icons'

const DhtProvideScreen: React.FC = () => {
  const { t } = useTranslation('diagnostics')

  const {
    data,
    loading,
    error,
    lastUpdated,
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

  const workerMax = sweep.workers?.max ?? 0
  const workerActive = sweep.workers?.active ?? 0
  const workerUtilization = workerMax > 0 ? workerActive / workerMax : 0

  return (
    <div className={'dht-provide ph4'}>
      <div className='dht-provide__header mb3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='f6 charcoal ma0'>
          <Trans
            i18nKey='dhtProvide.screen.description'
            t={t}
            components={[
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <a
                key='config'
                href='https://github.com/ipfs/kubo/blob/master/docs/config.md#provide'
                target='_blank'
                rel='noopener noreferrer'
                className='link blue'
              />,
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <a
                key='metrics'
                href='https://github.com/ipfs/kubo/blob/master/docs/provide-stats.md'
                target='_blank'
                rel='noopener noreferrer'
                className='link blue'
              />
            ]}
          />
        </p>

        <button
          className={`btn monospace f6 ph3 pv2 ${autoRefreshEnabled ? 'dht-provide__btn-auto-on' : 'dht-provide__btn-auto-off'}`}
          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
        >
          {autoRefreshEnabled
            ? t('dhtProvide.screen.refreshCountdown', { seconds: secondsLeft })
            : t('dhtProvide.screen.refreshOff')}
        </button>
      </div>

      <div className='dht-provide__grid'>
        {/* Row 1: Connectivity + Queues */}
        <Connectivity sweep={sweep} />
        <Queues sweep={sweep} />

        {/* Row 2: Schedule + Operations */}
        <Schedule sweep={sweep} />
        <Operations sweep={sweep} />

        {/* Row 3: Network + Workers */}
        <Network sweep={sweep} fullRT={data?.FullRT} />
        <Workers sweep={sweep} />
      </div>

      {workerUtilization >= 0.75 && (
        <div className='mt3 pa3 br2 bg-washed-yellow dark-gray flex items-start f6'>
          <GlyphAttention
            className='mr2 flex-shrink-0'
            style={{ width: 16, height: 16 }}
          />
          <div>
            {t('dhtProvide.screen.workersWarning', {
              percent: Math.round(workerUtilization * 100),
              max: workerMax
            })}
          </div>
        </div>
      )}
      {lastUpdated && (
        <div className='mt2 f7 charcoal-muted'>
          {t('dhtProvide.screen.lastUpdated', { time: new Date(lastUpdated).toLocaleTimeString() })}
        </div>
      )}
    </div>
  )
}

export default DhtProvideScreen
