import React, { useEffect, useState } from 'react'

import { useProvide } from '../../contexts/ProvideStat'
import './dht-provide.css'
import UnsupportedKuboVersion from 'src/components/unsupported-kubo-version/unsupported-kubo-version'
import { ReprovideCycle } from './ReprovideCycle'
import { CurrentBatch } from './CurrentBatch'
import { QueueStatus } from './QueueStatus'
import { Workers } from './Workers'
import { Network } from './Network'

const DhtProvideScreen: React.FC = () => {
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

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })
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

  useEffect(() => {
    let mq: MediaQueryList | null = null
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (ev: MediaQueryListEvent) => setIsDark(ev.matches)
      if (mq.addEventListener) mq.addEventListener('change', handler)
      else if (mq.addListener) mq.addListener(handler)
      return () => {
        if (!mq) return
        if (mq.removeEventListener) mq.removeEventListener('change', handler)
        else if (mq.removeListener) mq.removeListener(handler)
      }
    } catch {
      return undefined
    }
  }, [])
  const sweep = data?.Sweep

  if (!isAgentVersionSupported) {
    return <UnsupportedKuboVersion />
  }

  if (loading && !data) {
    return <div className='pa4'>Loading DHT provide stats…</div>
  }

  if (error) {
    return (
      <div className='pa4 red'>
        Failed to load provide stats: {error.message}
      </div>
    )
  }

  if (!sweep) {
    return (
      <div className='pa4'>
        DHT Sweep provider is not enabled on this node.
      </div>
    )
  }

  const workerUtilization =
    sweep.workers.max > 0
      ? sweep.workers.active / sweep.workers.max
      : 0

  return (
    <div className={`dht-provide pa4 ${isDark ? 'dht-provide--dark' : ''}`}>
      <div className='dht-provide__header mb4'>
        <h2 className='f4 fw6 ma0'>Diagnostics &gt; DHT Provide</h2>

        <div className='dht-provide__controls'>
          <div className='dht-provide__control-box'>
            <button className='btn mr2' onClick={() => refresh()}>
              Refresh
            </button>

            <button
              className={`btn ${autoRefreshEnabled ? 'dht-provide__btn-auto-on' : 'dht-provide__btn-auto-off'}`}
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              title={autoRefreshEnabled ? 'Auto-refresh is enabled' : 'Auto-refresh is disabled'}
            >
              {autoRefreshEnabled ? 'Auto: ON' : 'Auto: OFF'}
            </button>

            <span className='f6 charcoal-muted'>
              {autoRefreshEnabled ? `${secondsLeft}s` : ''}
            </span>
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
        <div className='dht-provide__warning mt4'>
          ⚠️ Workers at {Math.round(workerUtilization * 100)}% capacity. If the
          queue grows, consider increasing <code>Provide.DHT.MaxWorkers</code>
          (current: {sweep.workers.max}).
        </div>
      )}

      {/* Footer */}
      {lastUpdated && (
        <div className='dht-provide__last-updated'>
          Last updated at {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default DhtProvideScreen
