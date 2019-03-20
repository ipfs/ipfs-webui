import React from 'react'
import { Helmet } from 'react-helmet'
import { translate, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import ReactJoyride from 'react-joyride'
import StatusConnected from './StatusConnected'
import StatusNotConnected from './StatusNotConnected'
import NodeInfo from './NodeInfo'
import NodeInfoAdvanced from './NodeInfoAdvanced'
import NodeBandwidthChart from './NodeBandwidthChart'
import NetworkTraffic from './NetworkTraffic'
import Box from '../components/box/Box'
import AskToEnable from '../components/ask/AskToEnable'
import { statusTour } from '../lib/tours'
import withTour from '../components/tour/withTour'

const StatusPage = ({
  t,
  ipfsConnected,
  analyticsAskToEnable,
  doEnableAnalytics,
  doDisableAnalytics,
  toursEnabled,
  handleJoyrideCallback
}) => {
  return (
    <div data-id='StatusPage' className='mw9 center'>
      <Helmet>
        <title>{t('title')} - IPFS</title>
      </Helmet>
      <Box className='pa3 joyride-status-node' style={{ minHeight: 0 }}>
        <div className='flex'>
          <div className='flex-auto'>
            { ipfsConnected ? (
              <div>
                <StatusConnected />
                <NodeInfo />
                <div className='pt2'>
                  <NodeInfoAdvanced />
                </div>
              </div>
            ) : (
              <StatusNotConnected />
            )}
          </div>
        </div>
      </Box>
      { ipfsConnected && analyticsAskToEnable &&
        <AskToEnable
          className='mt3'
          label={t('AskToEnable.label')}
          yesLabel={t('AskToEnable.yesLabel')}
          noLabel={t('AskToEnable.noLabel')}
          detailsLabel={t('AskToEnable.detailsLabel')}
          detailsLink='#/settings/analytics'
          onYes={doEnableAnalytics}
          onNo={doDisableAnalytics} />
      }
      <Box className='mt3 pa3' style={{ opacity: ipfsConnected ? 1 : 0.4 }}>
        <div className='flex flex-column flex-row-l'>
          <div className='pr0 pr2-l flex-auto joyride-status-bandwith'>
            <NodeBandwidthChart />
          </div>
          <div className='dn db-l pl3 pr5 joyride-status-traffic'>
            <NetworkTraffic />
          </div>
        </div>
      </Box>

      <ReactJoyride
        run={toursEnabled}
        steps={statusTour.getSteps({ t, Trans })}
        styles={statusTour.styles}
        callback={handleJoyrideCallback}
        continuous
        scrollToFirstStep
        showProgress />
    </div>
  )
}

export default connect(
  'selectIpfsConnected',
  'selectAnalyticsAskToEnable',
  'selectToursEnabled',
  'doEnableAnalytics',
  'doDisableAnalytics',
  withTour(translate('status')(StatusPage))
)
