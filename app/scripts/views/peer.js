import React, {Component} from 'react'
import PropTypes from 'prop-types'
import i18n from '../utils/i18n.js'

export
default class Peer extends Component {
  static displayName = 'Peer';
  static propTypes = {
    peer: PropTypes.object,
    location: PropTypes.object
  };
  render () {
    return (
      <div className='webui-peer'>
        <div className='box info'>
          <p>
            <strong>{i18n.t('Peer ID')} </strong> <code>{this.props.peer.id}</code>&nbsp;
          </p>
          <br />
          <p>
            <strong>{i18n.t('Location')} </strong> {this.props.location.formatted || i18n.t('Unknown')}
          </p>
          <p>
            <strong>{i18n.t('Agent Version')} </strong> <code>{this.props.peer.agentVersion || ''}</code>
          </p>
          <p>
            <strong>{i18n.t('Protocol Version')} </strong> <code>{this.props.peer.protocolVersion || ''}</code>
          </p>
          <br />
          <div>
            <strong>{i18n.t('Public Key')}</strong>
            <pre className='panel textarea-panel'>{this.props.peer.publicKey || ''}</pre>
          </div>
        </div>
        <h4>{i18n.t('Network Addresses')}</h4>
        <div className='box addresses'>
          {(this.props.peer.addresses || []).map((address, i) => {
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
}
