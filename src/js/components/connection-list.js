import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Connection from './connection'

class ConnectionList extends Component {
  render () {
    const peers = this.props.peers || []

    return (
      <ul className='list-group'>
        {peers.map((peer, i) => {
          return <Connection {...peer} key={i} />
        })}
      </ul>
    )
  }
}

ConnectionList.displayName = 'ConnectionList'
ConnectionList.propTypes = {
  peers: PropTypes.array
}

export default ConnectionList
