import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ConfigView from '../views/config'
import {
  Row, Col
}
from 'react-bootstrap'
import {withIpfs} from '../components/ipfs'

class Config extends Component {
  static displayName = 'Config';
  static propTypes = {
    ipfs: PropTypes.object
  };

  state = {
    config: null
  };

  componentDidMount () {
    this.props.ipfs.config.get((err, configStream) => {
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

export default withIpfs(Config)
