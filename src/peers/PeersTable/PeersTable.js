import React from 'react'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import './PeersTable.css'

export class PeersTable extends React.Component {
  static propTypes = {
    peers: PropTypes.array
  }

  render () {
    const { peers } = this.props

    return (
      <div className='w-100'>
        <table className='PeersTable f6 collapse'>
          <thead>
            <tr className='gray'>
              <td className='pv2 ph4'>ID</td>
              <td className='pv2 ph4'>Network Address</td>
              <td className='pv2 ph4'>Location</td>
            </tr>
          </thead>
          <tbody className='lh-copy'>
            { peers && peers.map((peer, idx) => {
              const peerId = peer.peer.toB58String()
              const peerAddress = peer.addr.toString()
              const peerLocation = '@somewhere'

              return (
                <tr key={`peer-${idx}`}>
                  <td className='navy pv2 ph4'>{peerId}</td>
                  <td className='charcoal-muted pv2 ph4'>{peerAddress}</td>
                  <td className='navy b pv2 ph4'>{peerLocation}</td>
                </tr>
              )
            }) }
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect(
  'selectPeers',
  PeersTable
)
