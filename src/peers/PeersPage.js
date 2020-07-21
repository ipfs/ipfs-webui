import React from 'react'
import { connect } from 'redux-bundler-react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import ReactJoyride from 'react-joyride'
import withTour from '../components/tour/withTour'
import { peersTour } from '../lib/tours'
import { getJoyrideLocales } from '../helpers/i8n'

// Components
import Box from '../components/box/Box'
import WorldMap from './WorldMap/WorldMap'
import PeersTable from './PeersTable/PeersTable'
import AddConnection from './AddConnection/AddConnection'

const PeersPage = ({ t, toursEnabled, handleJoyrideCallback }) => (
  <div data-id='PeersPage' className='overflow-hidden'>
    <Helmet>
      <title>{t('title')} | IPFS</title>
    </Helmet>

    <div className='flex justify-end mb3'>
      <AddConnection />
    </div>

    <Box className='pt3 ph3 pb4'>
      <WorldMap className='joyride-peers-map' />
      <PeersTable className='joyride-peers-table' />
    </Box>

    <ReactJoyride
      run={toursEnabled}
      steps={peersTour.getSteps({ t })}
      styles={peersTour.styles}
      callback={handleJoyrideCallback}
      continuous
      scrollToFirstStep
      locale={getJoyrideLocales(t)}
      showProgress />
  </div>
)

export default connect(
  'selectToursEnabled',
  withTour(withTranslation('peers')(PeersPage))
)
