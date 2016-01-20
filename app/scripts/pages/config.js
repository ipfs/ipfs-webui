import React, {Component} from 'react'
import ConfigView from '../views/config'
import {
  Row, Col
}
from 'react-bootstrap'

export
default class Config extends Component {
  static displayName = 'Config';
  static propTypes = {
    ipfs: React.PropTypes.object
  };

  state = {
    config: null
  };

  componentDidMount () {
    this.props.ipfs.config.show((err, configStream) => {
      if (err) return console.error(err)

      this.setState({
        config: JSON.parse(configStream.toString())
      })
    })
  }

  render () {
    if (!this.state.config) return null

    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <ConfigView config={this.state.config} ipfs={this.props.ipfs} />
        </Col>
      </Row>
    )
  }
}
