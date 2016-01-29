import React, {Component} from 'react'
import {Row} from 'react-bootstrap'

import i18n from '../utils/i18n.js'

const LabeledProp = ({title, children}) => {
  return (
    <Row>
      <h5>{i18n.t(title)}</h5>
      {children}
    </Row>
  )
}

export default class Peer extends Component {
  static displayName = 'Peer';

  static propTypes = {
    peer: React.PropTypes.object,
    location: React.PropTypes.object
  };

  render () {
    const {peer, location} = this.props

    return (
      <div className='webui-peer'>
        <Row>
          <h2>{i18n.t('Node Info')}</h2>
        </Row>

        <LabeledProp title='Peer ID'>
          <code>{peer.ID}</code>
        </LabeledProp>

        <LabeledProp title='Location'>
          {location.formatted || i18n.t('Unknown')}
        </LabeledProp>

        <LabeledProp title='Agent Version'>
          <code>{peer.AgentVersion || ''}</code>
        </LabeledProp>

        <LabeledProp title='Protocol Version'>
          <code>{peer.ProtocolVersion || ''}</code>
        </LabeledProp>

        <LabeledProp title='Network Addresses'>
          <pre className='box addresses'>
            {(peer.Addresses || []).map((address, i) => {
              return address ? `${address}\n` : ''
            })}
          </pre>
        </LabeledProp>
      </div>
    )
  }
}
