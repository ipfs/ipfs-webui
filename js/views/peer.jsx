var React = require('react')
// var addr = require('./typography.jsx').addr
var copier = require('./copier.jsx')

var Peer = React.createClass({
  displayName: 'Peer',
  propTypes: {
    peer: React.PropTypes.object,
    location: React.PropTypes.object
  },
  render: function () {
    return (
      <div className='webui-peer'>
        <div className='box info'>
          <p>
            <strong>Peer ID: </strong> <code>{this.props.peer.ID}</code>&nbsp;
            <copier copyText={this.props.peer.ID}><i className='fa fa-copy' /></copier>
          </p>
          <br />
          <p>
            <strong>Location: </strong> {this.props.location.formatted || 'Unknown'}
          </p>
          <p>
            <strong>Agent Version: </strong> <code>{this.props.peer.AgentVersion || ''}</code>
          </p>
          <p>
            <strong>Protocol Version: </strong> <code>{this.props.peer.ProtocolVersion || ''}</code>
          </p>
          <br />
          <p>
            <strong>Public Key:</strong>
            <pre className='panel textarea-panel'>{this.props.peer.PublicKey || ''}</pre>
            <div className='pubkey-copy'>
              <copier copyText={this.props.peer.PublicKey}>
                <i className='fa fa-copy'></i> Copy
              </copier>
            </div>
          </p>
        </div>

        <h4>Network Addresses</h4>
        <div className='box addresses'>
          {(this.props.peer.Addresses || []).map(function (address, i) {
            if (!address) return
            return (
              <p key={i}>
                <code>{address}</code>&nbsp;
                <copier copyText={address}><i className='fa fa-copy' /></copier>
              </p>
            )
          })}
        </div>
      </div>
    )
  }
})

module.exports = Peer
