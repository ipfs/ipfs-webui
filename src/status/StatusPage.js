import React from 'react'
import { Helmet } from 'react-helmet'
import NodeBandwidthChart from './NodeBandwidthChart'
import PeerBandwidthTable from './PeerBandwidthTable'

export default () => (
  <div data-id='StatusPage'>
    <Helmet>
      <title>Status - IPFS</title>
    </Helmet>
    <h1>Status</h1>
    <NodeBandwidthChart />
    <PeerBandwidthTable />
  </div>
)
