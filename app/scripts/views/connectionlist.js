import React from 'react'
import Connection from './connection'

var ConnectionList = React.createClass({
  displayName: 'ConnectionList',
  propTypes: {
    peers: React.PropTypes.array
  },
  render: function () {
    var peers = this.props.peers || []

    return (
      <ul className='list-group'>
        {peers.map(function (peer, i) {
          return <Connection {...peer} key={i} />
        })}
      </ul>
    )
  }
})

module.exports = ConnectionList
