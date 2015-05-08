var React = require('react')
var Peer = require('./peer.jsx')

var Connection = React.createClass({
  displayName: 'Connection',
  propTypes: {
    location: React.PropTypes.object,
    BytesRead: React.PropTypes.number,
    BytesWritten: React.PropTypes.number,
    ID: React.PropTypes.string,
    Address: React.PropTypes.string
  },
  getInitialState: function () {
    return { open: false }
  },
  handleClick: function (e) {
    if (this.state.open) return this.setState({ open: false })

    var t = this
    t.props.ipfs.id(t.props.ID, function (err, peer) {
      if (err) return console.error(err)

      t.setState({
        open: true,
        peer: peer
      })
    })
  },

  render: function () {
    var peer = this.state.open ?
      <Peer
        peer={this.state.peer}
        location={this.props.location}
        bytesRead={this.props.BytesRead}
        bytesWritten={this.props.BytesWritten} />
      : null

    var className = 'webui-connection list-group-item'
    if (this.state.open) className += ' active'

    return (
      <li className={className}>
        <button className='btn btn-link' onClick={this.handleClick}>
          <strong>{this.props.ID}</strong>
          <br/>
          <span>{this.props.Address}</span>
          <i className='icon fa fa-lg fa-angle-down'></i>
        </button>
        {peer}
      </li>
    )
  }
})

module.exports = Connection
