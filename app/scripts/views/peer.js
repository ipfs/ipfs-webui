import React from 'react'
import i18n from '../utils/i18n.js'

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
            <strong>{i18n.t('Peer ID:')} </strong> <code>{this.props.peer.ID}</code>&nbsp;
          </p>
          <br />
          <p>
            <strong>{i18n.t('Location:')} </strong> {this.props.location.formatted || i18n.t('Unknown')}
          </p>
          <p>
            <strong>{i18n.t('Agent Version:')} </strong> <code>{this.props.peer.AgentVersion || ''}</code>
          </p>
          <p>
            <strong>{i18n.t('Protocol Version:')} </strong> <code>{this.props.peer.ProtocolVersion || ''}</code>
          </p>
          <br />
          <div>
            <strong>{i18n.t('Public Key:')}</strong>
            <pre className='panel textarea-panel'>{this.props.peer.PublicKey || ''}</pre>
          </div>
        </div>

        <h4>{i18n.t('Network Addresses')}</h4>
        <div className='box addresses'>
          {(this.props.peer.Addresses || []).map(function (address, i) {
            if (!address) return
            return (
              <p key={i}>
                <code>{address}</code>&nbsp;
              </p>
            )
          })}
        </div>
      </div>
    )
  }
})

module.exports = Peer
