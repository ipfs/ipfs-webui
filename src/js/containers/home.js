import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'
import i18n from '../utils/i18n.js'
import {pages} from '../actions'
import Peer from '../components/peer'

class Home extends Component {
  static propTypes = {
    load: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
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
          <h3>{i18n.t('Node Info')}</h3>
          <Peer peer={this.props.node} location={this.props.location} />
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  return {
    node: state.home.id,
    location: state.home.location
  }
}

export default connect(mapStateToProps, {
  ...pages.home
})(Home)
