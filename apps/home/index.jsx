var common = require('ipfs-webui-common')
var React = require('react')
var Peer = common.Peer
var getLocation = common.getLocation
var ipfsapp = require('ipfs-web-app')

var Home = React.createClass({
  displayName: 'Home',
  getInitialState: function () {
    var self = this
    self.props.ipfs.id(function (err, peer) {
      if (err || !peer) return console.error(err)
      self.setState({
        node: {
          peer: peer,
          location: {}
        }
      })

      getLocation(self.props.ipfs, peer.Addresses, function (err, location) {
        if (err || !location) return console.error(err)
        self.setState({
          node: {
            peer: peer,
            location: location
          }
        })
      })
    })

    // self.props.ipfs.config.get('Gateway.Enabled', function (err, enabled) {
    //   if (err) return console.error(err)
    //   self.setState({ GatewayEnabled: enabled.Value })
    // })

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
    var self = this
    var enabled = !self.state.GatewayEnabled
    var api = enabled ? self.props.ipfs.gateway.enable : self.props.ipfs.gateway.disable
    api(function (err) {
      if (err) return console.error(err)
      self.setState({ GatewayEnabled: enabled })
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

ipfsapp.define({
  init: function (ipfs) {
    React.render(<Home ipfs={ipfs} path={[]} />,
                 document.getElementById('mount'))
  }
})
