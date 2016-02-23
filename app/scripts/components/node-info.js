import React, {PropTypes, Component} from 'react'
import {Row, Col} from 'react-bootstrap'

import i18n from '../utils/i18n.js'

const LabeledProp = ({title, children}) => {
  return (
    <Row>
      <Col sm={12}>
        <strong>{`${i18n.t(title)}: `}</strong>
        {children}
      </Col>
    </Row>
  )
}

LabeledProp.prototype.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any
}

export default class NodeInfo extends Component {
  static displayName = 'NodeInfo';

  static propTypes = {
    data: PropTypes.object,
    location: PropTypes.object
  };

  static defaultProps = {
    data: {},
    location: {
      formatted: ''
    }
  };

  render () {
    const {data, location} = this.props

    return (
      <Col sm={12} className='webui-peer'>
        <h3>{i18n.t('Node Info')}</h3>

        <LabeledProp title='Peer ID'>
          <code>{data.ID}</code>
        </LabeledProp>

        <LabeledProp title='Location'>
          {location.formatted || i18n.t('Unknown')}
        </LabeledProp>

        <LabeledProp title='Agent Version'>
          <code>{data.AgentVersion || ''}</code>
        </LabeledProp>

        <LabeledProp title='Protocol Version'>
          <code>{data.ProtocolVersion || ''}</code>
        </LabeledProp>

        <LabeledProp title='Network Addresses'>
          <pre className='box addresses'>
            {(data.Addresses || []).map((address, i) => {
              return address ? `${address}\n` : ''
            })}
          </pre>
        </LabeledProp>
      </Col>
    )
  }
}
