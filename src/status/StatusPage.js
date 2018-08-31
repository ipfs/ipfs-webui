import React from 'react'
import { Helmet } from 'react-helmet'
import CountryChart from './CountryChart'
import NodeInfo from './NodeInfo'
import NodeBandwidthChart from './NodeBandwidthChart'
import PeerBandwidthTable from './PeerBandwidthTable'

export default () => (
  <div data-id='StatusPage'>
    <Helmet>
      <title>Status - IPFS</title>
    </Helmet>
    <NodeInfo />
    <div className='flex flex-column-s flex-column-m flex-row'>
      <div className='w-100-s w-100-m w-50 mt3 pr0-s pr0-m pr2'>
        <NodeBandwidthChart />
      </div>
      <div className='w-100-s w-100-m w-50 mt3 pl0-s pl0-m pl2'>
        <CountryChart />
      </div>
    </div>
    <PeerBandwidthTable className='mt3 pa4 overflow-x-auto' />
  </div>
)
