var React = require('react')
var Peer = require('../views/peer.jsx')
var getLocation = require('../getlocation.js')

var Home = React.createClass({
  displayName: 'Home',
  getInitialState: function () {
    var t = this
    t.props.ipfs.id(function (err, peer) {
      if (err || !peer) return console.error(err)
      t.setState({
        node: {
          peer: peer,
          location: {}
        }
      })

      getLocation(t.props.ipfs, peer.Addresses, function (err, location) {
        if (err || !location) return console.error(err)
        t.setState({
          node: {
            peer: peer,
            location: location
          }
        })
      })
    })

    t.props.ipfs.config.get('Gateway.Enabled', function (err, enabled) {
      if (err) return console.error(err)
      t.setState({ GatewayEnabled: enabled.Value })
    })

    return {
      node: {
        peer: {
          ID: '',
          PublicKey: '',
          Addresses: [],
          AgentVersion: '',
          ProtocolVersion: ''
        },
        location: { formatted: '' }
      },
      GatewayEnabled: false,
      GatewayUrl: 'http://localhost:8080/'
    }
  },

  onGatewayChange: function (e) {
    var t = this
    var enabled = !t.state.GatewayEnabled
    var api = enabled ? t.props.ipfs.gateway.enable : t.props.ipfs.gateway.disable
    api(function (err) {
      if (err) return console.error(err)
      t.setState({ GatewayEnabled: enabled })
    })
  },

  render: function () {
    var gatewayEnabled = this.state.GatewayEnabled
    var gatewayLink
    if (gatewayEnabled) {
      gatewayLink = <a href={this.state.GatewayUrl}>Go to gateway</a>
    }

    return (
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1'>

          <h3>Node Info</h3>
          <Peer {...this.state.node} />

          <div className='well hidden'>
            <h4>HTTP Gateway</h4>
            <div className='checkbox'>
              <label>
                <input type='checkbox' className='gateway-toggle' checked={gatewayEnabled} onChange={this.onGatewayChange}/>
                <strong>Enabled</strong>
              </label>
            </div>
            {gatewayLink}
          </div>

        </div>
      </div>
    )
  }
})

module.exports = Home
