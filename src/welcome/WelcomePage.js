import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import ReactJoyride from 'react-joyride'
import withTour from '../components/tour/withTour.js'
import { welcomeTour } from '../lib/tours.js'
import { getJoyrideLocales } from '../helpers/i8n.js'

// Components
import IsConnected from '../components/is-connected/IsConnected.js'
import IsNotConnected from '../components/is-not-connected/is-not-connected'
import AboutIpfs from '../components/about-ipfs/AboutIpfs.js'
import AboutWebUI from '../components/about-webui/AboutWebUI.js'
import ComponentLoader from '../loader/ComponentLoader.js'
import { useBridgeSelector } from '../helpers/context-bridge'

/**
 * @param {Object} props
 * @param {import('i18next').TFunction} props.t
 * @param {boolean} props.ipfsInitFailed
 * @param {boolean} props.ipfsConnected
 * @param {boolean} props.ipfsReady
 * @param {boolean} props.toursEnabled
 * @param {(data: any) => void} props.handleJoyrideCallback
 */
const WelcomePage = ({ t, ipfsInitFailed, ipfsConnected, ipfsReady, toursEnabled, handleJoyrideCallback }) => {
  const isSameOrigin = useBridgeSelector('selectIsSameOrigin')

  if (!ipfsInitFailed && !ipfsReady) {
    return <ComponentLoader />
  }

  return (
    <div>
      <Helmet>
        <title>{t('title')}</title>
      </Helmet>
      <div className='lh-copy charcoal'>
        <ConnectionStatus connected={ipfsConnected} sameOrigin={isSameOrigin} t={t} />
      </div>
      <ReactJoyride
        run={toursEnabled}
        steps={welcomeTour.getSteps({ t, Trans })}
        styles={welcomeTour.styles}
        callback={handleJoyrideCallback}
        scrollToFirstStep
        locale={getJoyrideLocales(t)} />
    </div>
  )
}

/**
 * @param {Object} props
 * @param {import('i18next').TFunction} props.t
 * @param {boolean} props.connected
 * @param {boolean} props.sameOrigin
 *
 * @returns {JSX.Element}
 */
const ConnectionStatus = ({ t: _t, connected }) => {
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
  'selectToursEnabled',
  withTour(withTranslation('welcome')(WelcomePage))
)
