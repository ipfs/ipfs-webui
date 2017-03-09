import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import {pages, logs} from '../actions'
import i18n from '../utils/i18n.js'
import LogViewer from './log-viewer'
import LogController from '../components/log-controller'

class Logs extends Component {
  static propTypes = {
    load: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    toggleTail: PropTypes.func.isRequired,
    selectLogSystem: PropTypes.func.isRequired,
    tail: PropTypes.bool.isRequired,
    systems: PropTypes.array.isRequired,
    selectedSystem: PropTypes.string.isRequired
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
        <Col sm={10} smOffset={1} className={'logs'}>
          <h3>{i18n.t('Event Log')}</h3>
          <LogController
            tail={this.props.tail}
            toggleTail={this.props.toggleTail}
            systems={this.props.systems}
            selectedSystem={this.props.selectedSystem}
            selectLogSystem={this.props.selectLogSystem} />
          <LogViewer />
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  return {
    tail: state.logs.tail,
    systems: state.logs.systems,
    selectedSystem: state.logs.selectedSystem
  }
}

export default connect(mapStateToProps, {
  ...pages.logs,
  toggleTail: logs.logs.toggleTail,
  selectLogSystem: logs.logs.selectSystem
})(Logs)
