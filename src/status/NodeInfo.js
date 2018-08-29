import React from 'react'
import { connect } from 'redux-bundler-react'
import ProgressDoughnut from './ProgressDoughnut'
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

class NodeInfo extends React.Component {
  state = {
    downSpeed: {
      filled: 0,
      total: 0
    },
    upSpeed: {
      filled: 0,
      total: 0
    }
  }

  componentDidUpdate (_, prevState) {
    const { stats } = this.props

    const down = stats ? parseInt(stats.bw.rateIn.toFixed(0), 10) : 0
    const up = stats ? parseInt(stats.bw.rateIn.toFixed(0), 10) : 0

    if (down !== prevState.downSpeed.filled || up !== prevState.upSpeed.filled) {
      this.setState({
        downSpeed: {
          filled: down,
          total: Math.max(down, prevState.downSpeed.total)
        },
        upSpeed: {
          filled: up,
          total: Math.max(up, prevState.upSpeed.total)
        }
      })
    }
  }

  render () {
    const { ipfsIdentity, stats, peers } = this.props
    const { downSpeed, upSpeed } = this.state

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
          <div className='w-100 w-50-l pl2-l mt3 mt0-l flex justify-between'>
            <div className='w-third'>
              <ProgressDoughnut
                title='Upload Speed'
                color='#69c4cd'
                {...upSpeed} />
            </div>
            <div className='w-third'>
              <ProgressDoughnut
                title='Download Speed'
                color='#f39021'
                {...downSpeed} />
            </div>
            <div className='w-third'>
              <ProgressDoughnut
                title='Storage'
                color='#0b3a53'
                filled={stats ? parseInt(stats.repo.repoSize.toFixed(0), 10) : 0}
                total={stats ? parseInt(stats.repo.storageMax.toFixed(0), 10) : 0 } />
            </div>
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
  }
}

export default connect(
  'selectIpfsIdentity',
  'selectPeers',
  'selectStats',
  NodeInfo
)
