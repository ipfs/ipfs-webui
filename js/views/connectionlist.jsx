var React = require('react')
var Table = require('react-bootstrap/Table')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var peers = this.props.peers || []

    return (
      <Table responsive className="table-hover">
        <thead>
          <tr>
            <th>Peer ID</th>
            <th>Address</th>
            <th>Bytes Sent</th>
            <th>Bytes Received</th>
          </tr>
        </thead>
        <tbody>
        {peers.map(function(peer) {
          return (
            <tr>
              <td>{addr(peer.ID)}</td>
              <td>{addr(peer.Address)}</td>
              <td>{peer.BytesWritten || 0}</td>
              <td>{peer.BytesRead || 0}</td>
            </tr>
          )
        })}
        </tbody>
      </Table>
    )
  }
})
