import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import {loadLogsPage, leaveLogsPage} from '../actions'
import i18n from '../utils/i18n.js'
import LogViewer from '../components/log-viewer'

class Logs extends Component {
  static propTypes = {
    loadLogsPage: PropTypes.func.isRequired,
    leaveLogsPage: PropTypes.func.isRequired,
    logs: PropTypes.array.isRequired
  };

  componentWillMount () {
    this.props.loadLogsPage()
  }

  componentWillUnmount () {
    this.props.leaveLogsPage()
  }

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1} className={'logs'}>
          <h3>{i18n.t('Event Log')}</h3>
          <LogViewer list={this.props.logs} />
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  return {
    logs: state.logs
  }
}

export default connect(mapStateToProps, {
  loadLogsPage,
  leaveLogsPage
})(Logs)
