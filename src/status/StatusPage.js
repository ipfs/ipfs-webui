import React from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import ReactJoyride from 'react-joyride'
import StatusConnected from './StatusConnected'
import BandwidthStatsDisabled from './BandwidthStatsDisabled'
import IsNotConnected from '../components/is-not-connected/IsNotConnected'
import NodeInfo from './NodeInfo'
import NodeInfoAdvanced from './NodeInfoAdvanced'
import NodeBandwidthChart from './NodeBandwidthChart'
import NetworkTraffic from './NetworkTraffic'
import Box from '../components/box/Box'
import AskToEnable from '../components/ask/AskToEnable'
import { statusTour } from '../lib/tours'
import { getJoyrideLocales } from '../helpers/i8n'
import withTour from '../components/tour/withTour'

const StatusPage = ({
  t,
  ipfsConnected,
  analyticsAskToEnable,
  doEnableAnalytics,
  doDisableAnalytics,
  doToggleAskToEnable,
  toursEnabled,
  handleJoyrideCallback,
  nodeBandwidthEnabled
}) => {
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
      { ipfsConnected && analyticsAskToEnable &&
        <AskToEnable
          className='mt3'
          label={t('AskToEnable.label')}
          yesLabel={t('app:actions.close')}
          onYes={() => doToggleAskToEnable(false)} />
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
  'selectAnalyticsAskToEnable',
  'selectToursEnabled',
  'doEnableAnalytics',
  'doDisableAnalytics',
  'doToggleAskToEnable',
  withTour(withTranslation('status')(StatusPage))
)
