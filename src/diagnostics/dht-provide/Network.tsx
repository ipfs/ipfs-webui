import React from 'react'
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

export const Network: React.FC<Props> = ({ sweep }) => {
  const connected = sweep.connectivity.status === 'online'

  const providesPerHour =
    sweep.operations.past.keys_provided_per_minute != null
      ? sweep.operations.past.keys_provided_per_minute * 60
      : null

  const provided = sweep.operations.past.keys_provided
  const failed = sweep.operations.past.keys_failed

  const successRate =
    provided + failed > 0
      ? `${((provided / (provided + failed)) * 100).toFixed(1)}%`
      : null

  return (
    <Card className='hover-bg-near-white'>
      <CardHeader className='pb2'>
        <div className='flex items-center'>
          <CardTitle className='f6 fw6 flex items-center mr2'>
            NETWORK
          </CardTitle>
          <IconTooltip
            text={'Network metrics for the DHT provide subsystem: connectivity status, number of peers, provides per hour, and success rate.'}
            position='top'
          >
            <GlyphInfo style={{ width: 14, height: 14 }} />
          </IconTooltip>
        </div>
      </CardHeader>

      <CardContent>
        {/* Status row */}
        <div className='flex items-center justify-between mb2'>
          <span className='f7 charcoal-muted'>Status</span>
          <span className='flex items-center'>
            <span
              className={`dib br-100 mr2 ${
                connected ? 'bg-green' : 'bg-red'
              }`}
              style={{ width: 8, height: 8 }}
            />
            <span className='f6 fw5'>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </span>
        </div>

        <MetricRow
          label='DHT Peers'
          value={sweep.network.peers.toLocaleString()}
        />

        {providesPerHour != null && (
          <MetricRow
            label='Provides/hr'
            value={providesPerHour.toLocaleString()}
          />
        )}

        {successRate && (
          <MetricRow
            label='Success'
            value={successRate}
            highlight
          />
        )}
      </CardContent>
    </Card>
  )
}
