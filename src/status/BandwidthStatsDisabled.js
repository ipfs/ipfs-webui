import React from 'react'
import { translate, Trans } from 'react-i18next'
import Shell from '../components/shell/Shell'
import Box from '../components/box/Box'

const StatusNotConnected = ({ t }) => {
  return (
    <Box className='mt3 pa3' >
      <h2 className='ttu yellow tracked f6 fw4 aqua mt0 mb4'>{t('bandwidthStats')}</h2>

      <p className='mw6 mr2 lh-copy charcoal f6'>
        <Trans i18nKey='bandwidthStatsDisabled'>
          You have the bandwidth metrics disabled. You can enable them by typing the command bellow
          or changing the key <code>Swarm.DisableBandwidthMetrics</code> to <code>false</code> on
          <a className='link blue' href='#/settings'>Settings</a>.
        </Trans>
      </p>

      <Shell>
        <code className='db'>$ ipfs config --json Swarm.DisableBandwidthMetrics false</code>
      </Shell>
    </Box>
  )
}

export default translate('status')(StatusNotConnected)
