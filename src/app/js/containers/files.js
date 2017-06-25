import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import Explorer from '../containers/files-explorer'
import {pages} from '../actions'

class Files extends Component {
  componentWillMount () {
    this.props.load()
  }

  componentWillUnmount () {
    this.props.leave()
  }

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <Explorer />
          {this.props.children}
        </Col>
      </Row>
    )
  }
}

Files.propTypes = {
  load: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,
  children: PropTypes.node
}

export default connect(null, {...pages.files})(Files)
