import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import Welcome from '../components/welcome'
import {pages} from '../actions'

class Home extends Component {
  static propTypes = {
    load: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired
  };

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
          <Welcome node={this.props.node} location={{}}/>
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  const {id} = state

  return {
    node: id
  }
}

export default connect(mapStateToProps, {
  ...pages.home
})(Home)
