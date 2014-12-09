var React = require('react')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    return (
      <div className="webui-peer">
        <br/>
        <ul className="list-group">
          <li className="list-group-item">
            <strong>Bytes Sent: </strong> {this.props.BytesSent || 0}
          </li>
          <li className="list-group-item">
            <strong>Bytes Received: </strong> {this.props.BytesReceived || 0}
          </li>
          <li className="list-group-item">
            <strong>Agent Version: </strong> {this.props.AgentVersion}
          </li>
          <li className="list-group-item">
            <strong>Protocol Version: </strong> {this.props.ProtocolVersion}
          </li>
          <li className="list-group-item">
            <strong>Public Key: </strong>
            <div className="panel panel-default" style={{height: '200px'}}>
              <textarea className="textarea-panel" readonly>{this.props.PublicKey}</textarea>
            </div>
          </li>
        </ul>

        <h4>Network Addresses</h4>
        <ul className="list-group">
          {this.props.Addresses.map(function(address) {
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
