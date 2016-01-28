import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import Peer from '../views/peer'
import i18n from '../utils/i18n.js'
import {loadHomePage} from '../actions'

class Home extends Component {
  static propTypes = {
    loadHomePage: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired
  };

  componentWillMount () {
    this.props.loadHomePage()
  }

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <h3>{i18n.t('Node Info')}</h3>
          <Peer peer={this.props.node} location={{}}/>
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
  loadHomePage
})(Home)
