var React = require('react')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    return (
      <div className="webui-peer">
        <br/>
        <ul className="list-group">
          <li className="list-group-item">
            <strong>Peer ID: </strong> {this.props.peer.ID}
          </li>
          <li className="list-group-item">
            <strong>Location: </strong> {this.props.location.formatted || 'Unknown'}
          </li>
          <li className="list-group-item hidden">
            <strong>Bytes Sent: </strong> {this.props.bytesWritten || ''}
          </li>
          <li className="list-group-item hidden">
            <strong>Bytes Received: </strong> {this.props.bytesRead || ''}
          </li>
          <li className="list-group-item">
            <strong>Agent Version: </strong> {this.props.peer.AgentVersion || ''}
          </li>
          <li className="list-group-item">
            <strong>Protocol Version: </strong> {this.props.peer.ProtocolVersion || ''}
          </li>
          <li className="list-group-item">
            <strong>Public Key: </strong>
            <div className="panel panel-default" style={{height: '200px'}}>
              <pre className="panel-inner">{this.props.peer.PublicKey || ''}</pre>
            </div>
          </li>
        </ul>

        <h4>Network Addresses</h4>
        <ul className="list-group">
          {(this.props.peer.Addresses || []).map(function(address) {
            if(address) {
              return <li className="list-group-item">{addr(address)}</li>
            }
          })}
        </ul>
        <br/>
      </div>
    )
  }
})
