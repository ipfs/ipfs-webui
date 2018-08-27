import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'

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

class NodeInfo extends React.Component {
  static propTypes = {
    ipfsIdentity: PropTypes.object.isRequired,
    peers: PropTypes.array.isRequired
  }

  state = {
    advanced: false
  }

  toggleAdvanced = () => {
    this.setState(s => ({ advanced: !s.advanced }))
  }

  render () {
    const { ipfsIdentity, peers } = this.props

    return (
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

        <div className='mt3'>
          <span className='pointer monospace' onClick={this.toggleAdvanced}>
            {this.state.advanced ? 'Hide' : 'Show'} advanced
            <span className='ml1 dib transition-all' style={this.state.advanced ? {transform: 'rotate(-180deg)'} : null}>▼</span>
          </span>
        </div>

        <div className='transition-all overflow-hidden' style={
          this.state.advanced ? {
            height: 'auto',
            marginTop: '1rem'
          } : {
            height: '0',
            marginTop: '0'
          }
        }>
          <Block>
            <Label>Public Key</Label>
            <Value wrap>{ipfsIdentity.publicKey}</Value>
          </Block>
          <Block>
            <Label>Addresses</Label>
            <Value wrap>{ipfsIdentity.addresses.map(addr => <div>{addr}</div>)}</Value>
          </Block>
        </div>
      </Box>
    )
  }
}

export default connect(
  'selectIpfsIdentity',
  'selectPeers',
  NodeInfo
)
