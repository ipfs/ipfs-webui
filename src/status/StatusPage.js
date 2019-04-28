import React from 'react'
import { Helmet } from 'react-helmet'
import { translate } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import StatusConnected from './StatusConnected'
import StatusNotConnected from './StatusNotConnected'
import NodeInfo from './NodeInfo'
import NodeInfoAdvanced from './NodeInfoAdvanced'
import NodeBandwidthChart from './NodeBandwidthChart'
import NetworkTraffic from './NetworkTraffic'
import Box from '../components/box/Box'
import AskToEnable from '../components/ask/AskToEnable'
import BandwidthStatsDisabled from './BandwidthStatsDisabled'

const StatusPage = ({ t, nodeBandwidthEnabled, ipfsConnected, analyticsAskToEnable, doEnableAnalytics, doDisableAnalytics }) => {
  return (
    <div data-id='StatusPage' className='mw9 center'>
      <Helmet>
        <title>{t('title')} - IPFS</title>
      </Helmet>
      <Box>
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
      { ipfsConnected && analyticsAskToEnable
        ? <AskToEnable
          className='mt3'
          label={t('AskToEnable.label')}
          yesLabel={t('AskToEnable.yesLabel')}
          noLabel={t('AskToEnable.noLabel')}
          detailsLabel={t('AskToEnable.detailsLabel')}
          detailsLink='#/settings/analytics'
          onYes={doEnableAnalytics}
          onNo={doDisableAnalytics}
        />
        : null
      }
      <div style={{ opacity: ipfsConnected ? 1 : 0.4 }}>
        { nodeBandwidthEnabled
          ? <Box className='mt3 pa3'>
            <div className='flex flex-column flex-row-l'>
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
      </div>
    </div>
  )
}

export default connect(
  'selectIpfsConnected',
  'selectNodeBandwidthEnabled',
  'selectAnalyticsAskToEnable',
  'doEnableAnalytics',
  'doDisableAnalytics',
  translate('status')(StatusPage)
)
