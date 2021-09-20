import React, { useEffect } from 'react'
import { connect } from 'redux-bundler-react'

export const IpnsManager = ({ ipfsReady, doFetchIpnsKeys, ipnsKeys }) => {
  useEffect(() => {
    ipfsReady && doFetchIpnsKeys()
  }, [ipfsReady, doFetchIpnsKeys])

  return (
    <div>{JSON.stringify(ipnsKeys)}</div>
  )
}

IpnsManager.defaultProps = {
  ipnsKeys: []
}

export default connect(
  'selectIpfsReady',
  'selectIpnsKeys',
  'doFetchIpnsKeys',
  'doGenerateIpnsKey',
  'doRemoveIpnsKey',
  'doRenameIpnsKey',
  IpnsManager
)
