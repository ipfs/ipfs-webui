import React from 'react'

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
    isAgentVersionSupported
  } = useProvide()

  const sweep = data?.Sweep

  // --- Guards --------------------------------------------------

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

  // --- Screen -------------------------------------------------

  const workerUtilization =
    sweep.workers.max > 0
      ? sweep.workers.active / sweep.workers.max
      : 0

  return (
    <div className='dht-provide pa4'>
      {/* Header */}
      <div className='dht-provide__header mb4'>
        <h2 className='f4 fw6 ma0'>Diagnostics &gt; DHT Provide</h2>

        <div className='dht-provide__controls'>
          <button className='btn mr2' onClick={() => refresh()}>
            Refresh
          </button>
          <span className='f6 charcoal-muted'>⟳ Auto: 60s</span>
        </div>
      </div>

      <div className='dht-provide__grid'>
        {/* Reprovide cycle full width */}
        <div className='dht-provide__full'>
          <ReprovideCycle sweep={sweep} />
        </div>

        {/* Current batch + queue */}
        <CurrentBatch sweep={sweep} />
        <QueueStatus sweep={sweep} />

        {/* Workers + network */}
        <Workers sweep={sweep} />
        <Network sweep={sweep} />
      </div>

      {/* Warning banner */}
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
