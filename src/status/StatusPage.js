import React from 'react'
import { Helmet } from 'react-helmet'
import { translate } from 'react-i18next'
import CountryChart from './CountryChart'
import NodeInfo from './NodeInfo'
import NodeBandwidthChart from './NodeBandwidthChart'
// import PeerBandwidthTable from './PeerBandwidthTable'
import Box from '../components/box/Box'

export default translate('status')(({ t }) => (
  <div data-id='StatusPage'>
    <Helmet>
      <title>{t('title')} - IPFS</title>
    </Helmet>
    <Box className='pa3'>
      <NodeInfo />
    </Box>
    <Box className='mt3 pa3'>
      <div className='flex flex-column-s flex-column-m flex-row'>
        <div className='w-100 w-60-l pr0 pr2-l'>
          <NodeBandwidthChart />
        </div>
        <div className='w-100 w-40-l pl0 pl2-l'>
          <CountryChart />
        </div>
      </div>
    </Box>
    {/* <PeerBandwidthTable className='mt3 pa4 overflow-x-auto' /> */}
  </div>
))
