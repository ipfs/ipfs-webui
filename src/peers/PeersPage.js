import React, { useCallback } from 'react'
import { connect } from 'redux-bundler-react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import ReactJoyride, { STATUS } from 'react-joyride'
import { peersTour } from '../lib/tours.js'
import { getJoyrideLocales } from '../helpers/i8n.js'
import { useTours } from '../contexts/tours-context'

// Components
import Box from '../components/box/Box.js'
import WorldMap from './WorldMap/WorldMap.js'
import PeersTable from './PeersTable/PeersTable.js'
import AddConnection from './AddConnection/AddConnection.js'
import CliTutorMode from '../components/cli-tutor-mode/CliTutorMode.js'
import { cliCmdKeys, cliCommandList } from '../bundles/files/consts.js'

const PeersPage = ({ t }) => {
  const { enabled: toursEnabled, disableTours } = useTours()
  const handleJoyrideCallback = useCallback((data) => {
    const { action, status } = data
    if (action === 'close' || status === STATUS.FINISHED) {
      disableTours()
    }
  }, [disableTours])
  return (
  <div data-id='PeersPage' className='overflow-hidden'>
    <Helmet>
      <title>{t('title')} | IPFS</title>
    </Helmet>

    <div className='flex justify-end items-center mb3'>
      <CliTutorMode showIcon={true} command={cliCommandList[cliCmdKeys.ADD_NEW_PEER]()} t={t}/>
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
}

export default connect(
  'selectIsCliTutorModeEnabled',
  withTranslation('peers')(PeersPage)
)
