import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'

import NodeInfo from './node-info'

export default class Welcome extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  render () {
    return (
      <div>
        <Row className='welcome'>
          <Col sm={12}>
            <h3>Welcome to IPFS</h3>
            <p>
              This is your central control point for IPFS on your machine.
              If you want to learn more you can visit our
              {' '}
              <a href='https://ipfs.io'>website</a>, IRC channel <code>#ipfs</code>
              on freenode or our
              {' '}
              <a href='https://github.com/ipfs'>GitHub organization</a>.
            </p>
          </Col>
        </Row>
        <Row>
          <NodeInfo data={this.props.node} location={this.props.location} />
        </Row>
      </div>
    )
  }
}
