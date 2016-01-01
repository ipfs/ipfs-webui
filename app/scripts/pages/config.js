import React from 'react'
import ConfigView from '../views/config'
import {Row, Col} from 'react-bootstrap'

export default React.createClass({
  displayName: 'Config',
  propTypes: {
    ipfs: React.PropTypes.object
  },
  getInitialState: function () {
    this.props.ipfs.config.show((err, configStream) => {
      if (err) return console.error(err)

      this.setState({
        config: JSON.parse(configStream.toString())
      })
    })

    return { config: null }
  },

  render: function () {
    var config = this.state.config
      ? <ConfigView config={this.state.config} ipfs={this.props.ipfs} />
      : null

    return (
      <Row>
        <Col sm={10} smOffset={1}>
          {config}
        </Col>
      </Row>
    )
  }
})
