import React from 'react'
import { connect } from 'redux-bundler-react'
import { Helmet } from 'react-helmet'
import { translate } from 'react-i18next'
import ReactJoyride from 'react-joyride'
import withTour from '../components/tour/withTour'
import { peersTour } from '../lib/tours'

// Components
import Box from '../components/box/Box'
import WorldMap from './WorldMap/WorldMap'
import PeersTable from './PeersTable/PeersTable'

const PeersPage = ({ t, toursEnabled, handleJoyrideCallback }) => (
  <div data-id='PeersPage'>
    <Helmet>
      <title>{t('title')} - IPFS</title>
    </Helmet>
    <Box className='pt3 ph3 pb4'>
      <WorldMap className='joyride-peers-map' />
      <PeersTable className='joyride-peers-table' />
    </Box>

    <ReactJoyride
      run={toursEnabled}
      steps={peersTour.steps}
      styles={peersTour.styles}
      callback={handleJoyrideCallback}
      continuous
      scrollToFirstStep
      showProgress />
  </div>
)

export default connect(
  'selectToursEnabled',
  withTour(translate('peers')(PeersPage))
)
