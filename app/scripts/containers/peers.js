import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Row, Col} from 'react-bootstrap'

import {loadPeersPage} from '../actions'
import i18n from '../utils/i18n'
import PeersViewer from '../components/peers-viewer'

class Peers extends Component {
  static propTypes = {
    loadPeersPage: PropTypes.func.isRequired,
    ids: PropTypes.array.isRequired,
    details: PropTypes.object.isRequired
  };

  componentWillMount () {
    this.props.loadPeersPage()
  }

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <h3>{i18n.t('Peers')}</h3>
          <PeersViewer ids={this.props.ids} details={this.props.details}/>
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  return state.peers
}

export default connect(mapStateToProps, {
  loadPeersPage
})(Peers)
