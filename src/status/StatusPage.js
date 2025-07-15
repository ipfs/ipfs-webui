import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import ReactJoyride from 'react-joyride'
import StatusConnected from './StatusConnected.js'
import BandwidthStatsDisabled from './BandwidthStatsDisabled.js'
import IsNotConnected from '../components/is-not-connected/IsNotConnected.js'
import NodeInfo from './NodeInfo.js'
import NodeInfoAdvanced from './NodeInfoAdvanced.js'
import NodeBandwidthChart from './NodeBandwidthChart.js'
import NetworkTraffic from './NetworkTraffic.js'
import Box from '../components/box/Box.js'
import AnalyticsBanner from '../components/analytics-banner/AnalyticsBanner.js'
import { statusTour } from '../lib/tours.js'
import { getJoyrideLocales } from '../helpers/i8n.js'
import withTour from '../components/tour/withTour.js'
import { IDENTITY_REFRESH_INTERVAL } from '../bundles/identity.js'

const StatusPage = ({
  t,
  ipfsConnected,
  showAnalyticsComponents,
  showAnalyticsBanner,
  doEnableAnalytics,
  doDisableAnalytics,
  doToggleShowAnalyticsBanner,
  toursEnabled,
  handleJoyrideCallback,
  nodeBandwidthEnabled,
  doFetchIdentity,
  isNodeInfoOpen
}) => {
  // Refresh identity when page mounts
  useEffect(() => {
    if (ipfsConnected) {
      doFetchIdentity()
    }
  }, [ipfsConnected, doFetchIdentity])

  // Refresh identity when Advanced section is open
  useEffect(() => {
    if (ipfsConnected && isNodeInfoOpen) {
      const intervalId = setInterval(() => {
        doFetchIdentity()
      }, IDENTITY_REFRESH_INTERVAL)

      return () => clearInterval(intervalId)
    }
  }, [ipfsConnected, isNodeInfoOpen, doFetchIdentity])
  return (
    <div data-id='StatusPage' className='mw9 center'>
      <Helmet>
        <title>{t('title')} | IPFS</title>
      </Helmet>
      <Box className='pa3 joyride-status-node' style={{ minHeight: 0 }}>
        <div className='flex'>
          <div className='flex-auto'>
            { ipfsConnected
              ? (
              <div>
                <StatusConnected />
                <NodeInfo />
                <div className='pt2'>
                  <NodeInfoAdvanced />
                </div>
              </div>
                )
              : (
              <div>
                <IsNotConnected />
              </div>
                )}
          </div>
        </div>
      </Box>
      { ipfsConnected && showAnalyticsComponents && showAnalyticsBanner &&
        <AnalyticsBanner
          className='mt3'
          label={t('AnalyticsBanner.label')}
          yesLabel={t('app:actions.close')}
          onYes={() => doToggleShowAnalyticsBanner(false)} />
      }
      <div style={{ opacity: ipfsConnected ? 1 : 0.4 }}>
        { nodeBandwidthEnabled
          ? <Box className='mt3 pa3'>
            <div className='flex flex-column flex-row-l joyride-status-charts'>
              <div className='pr0 pr2-l flex-auto'>
                <NodeBandwidthChart />
              </div>
              <div className='dn db-l pl3 pr5'>
                <NetworkTraffic />
              </div>
            </div>
          </Box>
          : <BandwidthStatsDisabled />
        }
        <ReactJoyride
          run={toursEnabled}
          steps={statusTour.getSteps({ t, Trans })}
          styles={statusTour.styles}
          callback={handleJoyrideCallback}
          continuous
          scrollToFirstStep
          locale={getJoyrideLocales(t)}
          showProgress />
      </div>
    </div>
  )
}

export default connect(
  'selectIpfsConnected',
  'selectNodeBandwidthEnabled',
  'selectShowAnalyticsBanner',
  'selectShowAnalyticsComponents',
  'selectToursEnabled',
  'selectIsNodeInfoOpen',
  'doEnableAnalytics',
  'doDisableAnalytics',
  'doToggleShowAnalyticsBanner',
  'doFetchIdentity',
  withTour(withTranslation('status')(StatusPage))
)
