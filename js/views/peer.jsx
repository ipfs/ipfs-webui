var React = require('react')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    return (
      <div className="webui-peer">
        <div className="box">
        <p>
          <strong>Peer ID: </strong> <code>{this.props.peer.ID}</code>
        </p>
        <br/>
        <p>
          <strong>Location: </strong> {this.props.location.formatted || 'Unknown'}
        </p>
        <p>
          <strong>Agent Version: </strong> <code>{this.props.peer.AgentVersion || ''}</code>
        </p>
        <p>
          <strong>Protocol Version: </strong> <code>{this.props.peer.ProtocolVersion || ''}</code>
        </p>
        <br/>
        <p>
          <strong>Public Key:</strong>
          <pre className="panel textarea-panel">
            {this.props.peer.PublicKey || ''}
          </pre>
          <a href="#" className="copy">Copy to clipboard</a>
        </p>
        </div>

        <h4>Network Addresses</h4>
        <div className="box addresses">
          {(this.props.peer.Addresses || []).map(function(address) {
            if(address) return <p><code>{address}</code></p>
          })}
        </div>
      </div>
    )
  }
})
