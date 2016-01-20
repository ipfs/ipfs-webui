import React, {Component, PropTypes} from 'react'
import {Table} from 'react-bootstrap'

import Connection from './connection'

export
default class ConnectionList extends Component {
  static displayName = 'ConnectionList';
  static propTypes = {
    peers: PropTypes.array.isRequired
  };

  render () {
    return (
      <Table responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Network Address</th>
            <th>Agent</th>
            <th>Protocol</th>
          </tr>
        </thead>
        <tbody>
          {this.props.peers.map((peer, i) => {
            return <Connection {...peer} key={i} />
          })}
        </tbody>
      </Table>
    )
  }
}
