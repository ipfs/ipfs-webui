import React from 'react'
import { Helmet } from 'react-helmet'
import { translate } from 'react-i18next'

// Components
import Box from '../components/box/Box'
import WorldMap from './WorldMap/WorldMap'
import PeersTable from './PeersTable/PeersTable'
import AddConnection from './AddConnection/AddConnection'

const PeersPage = ({ t }) => (
  <div data-id='PeersPage'>
    <Helmet>
      <title>{t('title')} - IPFS</title>
    </Helmet>

    <div className='flex justify-end mb3'>
      <AddConnection />
    </div>

    <Box className='pt3 ph3 pb4'>
      <WorldMap />
      <PeersTable />
    </Box>
  </div>
)

export default translate('peers')(PeersPage)
