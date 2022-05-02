import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'

import RetroButton from '../common/atoms/RetroButton'
import StatusIcon from '../../icons/retro/StatusIcon'

// const pickColor = (ipfsReady, ipfsConnected) => {
//   if (ipfsReady && ipfsConnected) return 'teal'
//   if (ipfsReady) return 'red'
//   return 'gray'
// }

const pickTitleKey = (ipfsReady, ipfsConnected) => {
  if (ipfsReady && ipfsConnected) return 'app:status.connectedToIpfs'
  if (ipfsReady) return 'ipfsApiRequestFailed'
  return 'app:status.connectingToIpfs'
}

export const Connected = ({ t, className, size = 28, ipfsReady, ipfsConnected, doSetIsNodeInfoOpen }) => {
  const title = t(pickTitleKey(ipfsReady, ipfsConnected))

  return (
    <a title={title} className={`dib ${className}`} href='#/status' onClick={() => doSetIsNodeInfoOpen(true)}>
      <RetroButton style={{ margin: '0 1px' }} width='28px' height='28px'>
        <StatusIcon />
      </RetroButton>
    </a>
  )
}

export default connect(
  'selectIpfsReady',
  'selectIpfsConnected',
  'doSetIsNodeInfoOpen',
  withTranslation('notify')(Connected)
)
