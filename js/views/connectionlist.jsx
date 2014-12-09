var React = require('react')
var Table = require('react-bootstrap/Table')
var addr = require('./typography.jsx').addr

var Peer = require('./peer.jsx')

var Connection = React.createClass({
  getInitialState: function() {
    return { open: false }
  },

  handleClick: function(e) {
    if(this.state.open) return this.setState({ open: false })

    var t = this
    t.props.ipfs.id(t.props.ID, function(err, peer) {
      if(err) return console.error(err)

      console.log(peer)
      t.setState({
        open: true,
        peer: peer
      })
    })
  },

  render: function() {
    var peer = this.state.open ? Peer(this.state.peer) : null
    var className = 'webui-connection list-group-item'
    if(this.state.open) className += ' active'

    return (
      <li className={className}>
        <button className="btn btn-link" onClick={this.handleClick}>
          <strong>{this.props.ID}</strong> - {this.props.Address}
        </button>
        {peer}
      </li>
    )
  }
})

module.exports = React.createClass({
  render: function() {
    var peers = this.props.peers || []

    return (
      <ul className="list-group">
        {peers.map(function(peer) {
          return Connection(peer)
        })}
      </ul>
    )
  }
})
