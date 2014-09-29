var React = require('react')
var Table = require('react-bootstrap/Table')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var peers = this.props.peers
    var table = peers.map(function(peer) {
      return [addr(peer.id), addr(peer.address)]
    })

    return (
      <Table responsive className="table-hover">
        <thead>
          <tr>
            <th>Peer ID</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
        {peers.map(function(peer) {
          return (
            <tr>
              <td>{addr(peer.id)}</td>
              <td>{addr(peer.address)}</td>
            </tr>
          )
        })}
        </tbody>
      </Table>
    )
  }
})
