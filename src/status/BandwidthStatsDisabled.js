import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Shell from '../components/shell/Shell.js'
import Box from '../components/box/Box.js'

const StatusNotConnected = ({ t }) => {
  return (
    <Box className='mt3 pa3' >
      <h2 className='ttu yellow tracked f6 fw4 aqua mt0 mb4'>{t('bandwidthStats')}</h2>

      <p className='mw6 mr2 lh-copy charcoal f6'>
        <Trans i18nKey='bandwidthStatsDisabled' t={t}>
          You have the bandwidth metrics disabled. You can enable them by typing the command bellow
          or changing the key <code>Swarm.DisableBandwidthMetrics</code> to <code>false</code> on
          <a className='link blue' href='#/settings'>Settings</a>. Then, you need to restart the IPFS
          daemon to apply the changes.
        </Trans>
      </p>

      <Shell className='mw6'>
        <code className='db'><b className='no-select'>$ </b>ipfs config --json Swarm.DisableBandwidthMetrics false</code>
      </Shell>
    </Box>
  )
}

export default withTranslation('status')(StatusNotConnected)
