import React from 'react'
import { connect } from 'redux-bundler-react'

export function PeersPage ({ peers, liveUpdate, doToggleLiveUpdate }) {
  return (
    <div>
      <h1 data-id='title'>Peers</h1>
      <button
        onClick={doToggleLiveUpdate}
        className='button-reset bg-green b--green white ph4 pv3'>
        {liveUpdate ? 'Stop' : 'GO!'}
      </button>
      {peers ? (
        peers.map((p, i) => {
          const id = p.peer.toB58String()
          return <div key={i}>{id}</div>
        })
      ) : null}
    </div>
  )
}

export default connect(
  'selectPeers',
  'selectLiveUpdate',
  'doToggleLiveUpdate',
  PeersPage
)
