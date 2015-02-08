var React = require('react')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    return (
      <div className="webui-peer">
        <div className="box">
        <p>
          <strong>Peer ID: </strong> {this.props.peer.ID}
        </p>
        <br/>
        <p>
          <strong>Location: </strong> {this.props.location.formatted || 'Unknown'}
        </p>
        <p>
          <strong>Agent Version: </strong> {this.props.peer.AgentVersion || ''}
        </p>
        <p>
          <strong>Protocol Version: </strong> {this.props.peer.ProtocolVersion || ''}
        </p>
        <br/>
        <p>
          <strong>Public Key:</strong>
          <div className="panel textarea-panel"><textarea className="panel-inner" style={{height: '210px'}} value={this.props.peer.PublicKey || ''} readonly/></div>
          <a href="#" className="copy">Copy to clipboard</a>
        </p>
        </div>

        <h4>Network Addresses</h4>
        <div className="box addresses">
          {(this.props.peer.Addresses || []).map(function(address) {
            if(address) return <p>{address}</p>
          })}
        </div>
      </div>
    )
  }
})
