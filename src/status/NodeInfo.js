import React, { Component } from 'react'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'

export class NodeInfo extends Component {
  render () {
    const {ipfsIdentity} = this.props
    console.log(this.props)
    return (
      <Box>
        <pre>
          { JSON.stringify(ipfsIdentity, null, 2) }
        </pre>
      </Box>
    )
  }
}

export default connect(
  'selectIpfsIdentity',
  NodeInfo
)
