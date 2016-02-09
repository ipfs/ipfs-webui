import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import {loadLogsPage, leaveLogsPage, logs} from '../actions'
import i18n from '../utils/i18n.js'
import LogViewer from '../components/log-viewer'
import LogController from '../components/log-controller'

class Logs extends Component {
  static propTypes = {
    loadLogsPage: PropTypes.func.isRequired,
    leaveLogsPage: PropTypes.func.isRequired,
    toggleTail: PropTypes.func.isRequired,
    selectLogSystem: PropTypes.func.isRequired,
    logs: PropTypes.array.isRequired,
    tail: PropTypes.bool.isRequired,
    systems: PropTypes.array.isRequired,
    selectedSystem: PropTypes.string.isRequired
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
          <LogController
            tail={this.props.tail}
            toggleTail={this.props.toggleTail}
            systems={this.props.systems}
            selectedSystem={this.props.selectedSystem}
            selectLogSystem={this.props.selectLogSystem} />
          <LogViewer
            list={this.props.logs}
            tail={this.props.tail}
            selectedSystem={this.props.selectedSystem} />
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  return {
    logs: state.logs.list,
    tail: state.logs.tail,
    systems: state.logs.systems,
    selectedSystem: state.logs.selectedSystem
  }
}

export default connect(mapStateToProps, {
  loadLogsPage,
  leaveLogsPage,
  toggleTail: logs.toggleTail,
  selectLogSystem: logs.selectSystem
})(Logs)
