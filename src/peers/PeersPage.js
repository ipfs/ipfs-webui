import React from 'react'
import { Helmet } from 'react-helmet'
import { translate } from 'react-i18next'

// Components
import Box from '../components/box/Box'
import WorldMap from './WorldMap/WorldMap'
import PeersTable from './PeersTable/PeersTable'

const PeersPage = ({ t }) => (
  <div data-id='PeersPage'>
    <Helmet>
      <title>{t('title')} - IPFS</title>
    </Helmet>
    <Box className='pa3'>
      <WorldMap />
      <PeersTable />
    </Box>
  </div>
)

export default translate('peers')(PeersPage)
