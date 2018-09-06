import React from 'react'
import { connect } from 'redux-bundler-react'
import { Helmet } from 'react-helmet'
import { translate } from 'react-i18next'

// Components
import WorldMap from './WorldMap/WorldMap'
import PeersTable from './PeersTable/PeersTable'

const PeersPage = ({ t, peers, peerCoordinates, tableData }) => (
  <div data-id='PeersPage'>
    <Helmet>
      <title>{t('title')} - IPFS</title>
    </Helmet>

    <div className='bg-snow-muted pa3'>
      <WorldMap peers={peers} coordinates={peerCoordinates} />
      <PeersTable peers={tableData} />
    </div>
  </div>
)

export default connect(
  'selectPeers',
  'selectPeerCoordinates',
  'selectTableData',
  translate('peers')(PeersPage)
)
