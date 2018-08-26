import React from 'react'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'

const Block = ({label, value}) => (
  <div className='dt dt--fixed pt2'>
    <label className='dtc silver tracked ttu f7' style={{width: '100px'}}>{label}</label>
    <div className='dtc truncate charcoal monospace'>{value}</div>
  </div>
)

export function NodeInfo ({ ipfsIdentity, peers }) {
  return (
    <Box>
      <h2 className='dib tracked ttu f6 fw2 teal-muted hover-aqua link mt0 mb2'>Node Info</h2>

      <div className='f6 flex flex-column flex-row-l'>
        <div className='w-100 w-50-l pr2-l'>
          <Block label='CID' value={ipfsIdentity.id} />
          <Block label='Peers' value={peers ? peers.length : 0} />
          <Block label='Version' value={ipfsIdentity.agentVersion} />
        </div>
        <div className='w-100 w-50-l pl2-l mt3 mt0-l'>
          Right Side
        </div>
      </div>
    </Box>
  )
}

export default connect(
  'selectIpfsIdentity',
  'selectPeers',
  NodeInfo
)
