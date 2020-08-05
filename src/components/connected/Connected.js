import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'

const pickColor = (ipfsReady, ipfsConnected) => {
  if (ipfsReady && ipfsConnected) return 'teal'
  if (ipfsReady) return 'red'
  return 'gray'
}

const pickTitleKey = (ipfsReady, ipfsConnected) => {
  if (ipfsReady && ipfsConnected) return 'connectedToIpfs'
  if (ipfsReady) return 'ipfsApiRequestFailed'
  return 'connectingToIpfs'
}

export const Connected = ({ t, ipfsReady, ipfsConnected, className, size = 28 }) => {
  const title = t(pickTitleKey(ipfsReady, ipfsConnected))
  const fill = pickColor(ipfsReady, ipfsConnected)
  const opacity = ipfsConnected ? 'o-60' : 'o-100'

  return (
    <a title={title} className={`dib ${className}`} href='#/status?fromConnected=1'>
      <svg className={`${fill} ${opacity} fill-current-color transition-all glow`} viewBox='0 0 24 24' width={size} height={size} aria-hidden="true">
        <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z ' />
      </svg>
    </a>
  )
}

export default connect(
  'selectIpfsReady',
  'selectIpfsConnected',
  withTranslation('notify')(Connected)
)
