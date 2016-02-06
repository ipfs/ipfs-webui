import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import {loadLogsPage} from '../actions'
import i18n from '../utils/i18n.js'

class Logs extends Component {
  static propTypes = {
    loadLogsPage: PropTypes.func.isRequired,
    logs: PropTypes.array.isRequired
  };

  componentWillMount () {
    this.props.loadLogsPage()
  }

  componentDidUpdate () {
    if (this.state.tailing) {
      const node = ReactDOM.findDOMNode(this)
      const container = node.getElementsByClassName('textarea-panel')[0]

      container.scrollTop = container.scrollHeight + 30
    }
  }

  render () {
    const logs = this.props.logs.map(event => (
      <pre key={event.time}>
        {JSON.stringify(event, null, '  ')}
      </pre>
    ))

    return (
      <Row>
        <Col sm={10} smOffset={1} className={'webui-logs'}>
          <h3>{i18n.t('Event Log')}</h3>
          <div className='textarea-panel panel panel-default padded'>
            {logs}
          </div>
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
  loadLogsPage
})(Logs)
