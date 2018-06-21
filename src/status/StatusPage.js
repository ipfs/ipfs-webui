import React from 'react'
import { Helmet } from 'react-helmet'
import PeerBandwidthTable from './PeerBandwidthTable'

export default () => (
  <div data-id='StatusPage'>
    <Helmet>
      <title>Status - IPFS</title>
    </Helmet>
    <h1>Status</h1>
    <PeerBandwidthTable />
  </div>
)
