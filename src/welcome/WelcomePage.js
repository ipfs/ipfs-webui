import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import ReactJoyride from 'react-joyride'
import withTour from '../components/tour/withTour.js'
import { welcomeTour } from '../lib/tours.js'
import { getJoyrideLocales } from '../helpers/i8n.js'

// Components
import IsConnected from '../components/is-connected/IsConnected.tsx'
import IsNotConnected from '../components/is-not-connected/IsNotConnected.js'
import AboutIpfs from '../components/about-ipfs/AboutIpfs.tsx'
import AboutWebUI from '../components/about-webui/AboutWebUI.tsx'
import ComponentLoader from '../loader/ComponentLoader.js'

const WelcomePage = ({ t, ipfsInitFailed, ipfsConnected, ipfsReady, toursEnabled, handleJoyrideCallback }) => {
  if (!ipfsInitFailed && !ipfsReady) {
    return <ComponentLoader />
  }

  return (
    <div>
      <Helmet>
        <title>{t('title')}</title>
      </Helmet>
      <div className='lh-copy charcoal'>
        <ConnectionStatus connected={ipfsConnected} />
      </div>
      <ReactJoyride
        run={toursEnabled}
        steps={welcomeTour.getSteps({ t })}
        styles={welcomeTour.styles}
        callback={handleJoyrideCallback}
        scrollToFirstStep
        locale={getJoyrideLocales(t)} />
    </div>
  )
}

const ConnectionStatus = ({ connected }) => {
  if (connected) {
    return (
      <div>
        <IsConnected />
        <div className='flex-ns mt3'>
          <div className='mr3-ns lh-copy mid-gray w-50-ns'>
            <AboutWebUI />
          </div>
          <div className='lh-copy mid-gray w-50-ns mt3 mt0-ns'>
            <AboutIpfs />
          </div>
        </div>
      </div>
    )
  }
  return (
    <IsNotConnected />
  )
}

export default connect(
  'selectIpfsInitFailed',
  'selectIpfsConnected',
  'selectIpfsReady',
  'selectApiUrl',
  'selectToursEnabled',
  withTour(withTranslation('welcome')(WelcomePage))
)
