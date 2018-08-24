import React, { Component } from 'react'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'

const Block = ({label, value}) => (
  <div className='dt dt--fixed pt2'>
    <label className='dtc silver tracked ttu f7' style={{width: '100px'}}>{label}</label>
    <div className='dtc truncate charcoal monospace'>{value}</div>
  </div>
)

export class NodeInfo extends Component {
  render () {
    const {ipfsIdentity} = this.props
    console.log(this.props)
    return (
      <Box>
        <h2 className='dib tracked ttu f6 fw2 teal-muted hover-aqua link mt0 mb2'>Node Info</h2>

        <div className='f6'>
          <Block label='CID' value={ipfsIdentity.id} />
          <Block label='Public Key' value={ipfsIdentity.publicKey} />
        </div>
      </Box>
    )
  }
}

export default connect(
  'selectIpfsIdentity',
  NodeInfo
)
