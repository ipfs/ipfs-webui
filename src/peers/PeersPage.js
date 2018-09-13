import React from 'react'
import { connect } from 'redux-bundler-react'
import { Helmet } from 'react-helmet'
import { translate } from 'react-i18next'

// Components
import Box from '../components/box/Box'
import WorldMap from './WorldMap/WorldMap'
import PeersTable from './PeersTable/PeersTable'

const PeersPage = ({ t, peers, peerCoordinates, tableData }) => (
  <div data-id='PeersPage'>
    <Helmet>
      <title>{t('title')} - IPFS</title>
    </Helmet>
    <Box className='pa3'>
      <WorldMap peers={peers} coordinates={peerCoordinates} />
      <PeersTable peers={tableData} />
    </Box>
  </div>
)

export default connect(
  'selectPeers',
  'selectPeerCoordinates',
  'selectTableData',
  translate('peers')(PeersPage)
)
