import React from 'react'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'
import 'details-polyfill'

const Block = ({ children }) => (
  <div className='dt dt--fixed pt2'>
    { children }
  </div>
)

const Label = ({ children }) => (
  <label className='dtc silver tracked ttu f7' style={{width: '100px'}}>{children}</label>
)

const Value = ({ children, wrap = false }) => (
  <div className={`dtc charcoal monospace ${wrap ? 'word-wrap' : 'truncate'}`}>{children}</div>
)

const NodeInfo = ({ ipfsIdentity, peers }) => (
  <Box className='f6 pa4'>
    <h2 className='dib tracked ttu f6 fw2 teal-muted hover-aqua link mt0 mb2'>Node Info</h2>

    <div className='flex flex-column flex-row-l'>
      <div className='w-100 w-50-l pr2-l'>
        <Block>
          <Label>CID</Label>
          <Value>{ipfsIdentity.id}</Value>
        </Block>
        <Block>
          <Label>Peers</Label>
          <Value>{peers ? peers.length : 0}</Value>
        </Block>
        <Block>
          <Label>Version</Label>
          <Value>{ipfsIdentity.agentVersion}</Value>
        </Block>
      </div>
      <div className='w-100 w-50-l pl2-l mt3 mt0-l'>
        Right Side
      </div>
    </div>

    <details className='mt3'>
      <summary className='pointer monospace outline-0'>Advanced</summary>
      <div className='mt3'>
        <Block>
          <Label>Public Key</Label>
          <Value wrap>{ipfsIdentity.publicKey}</Value>
        </Block>
        <Block>
          <Label>Addresses</Label>
          <Value wrap>{ipfsIdentity.addresses.map(addr => <div key={addr}>{addr}</div>)}</Value>
        </Block>
      </div>
    </details>
  </Box>
)

export default connect(
  'selectIpfsIdentity',
  'selectPeers',
  NodeInfo
)
