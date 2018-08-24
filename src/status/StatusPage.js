import React from 'react'
import { Helmet } from 'react-helmet'
import CountryChart from './CountryChart'
import NodeInfo from './NodeInfo'
import NodeBandwidthChart from './NodeBandwidthChart'

export default () => (
  <div data-id='StatusPage'>
    <Helmet>
      <title>Status - IPFS</title>
    </Helmet>
    <h1>Status</h1>
    <CountryChart />
    <NodeBandwidthChart />
    <NodeInfo />
    <NodeBandwidthChart />
  </div>
)
