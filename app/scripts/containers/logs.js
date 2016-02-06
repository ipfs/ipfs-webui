import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Row, Col, Table} from 'react-bootstrap'
import {connect} from 'react-redux'
import {isEqual, map} from 'lodash'

import {loadLogsPage} from '../actions'
import i18n from '../utils/i18n.js'

class LogEntry extends Component {
  static propTypes = {
    time: PropTypes.string,
    system: PropTypes.string,
    details: PropTypes.object
  };

  shouldComponentUpdate (nextProps) {
    return isEqual(nextProps, this.props)
  }

  render () {
    const {time, system, details} = this.props
    const detailsList = map(details, (value, key) => (
      <div key={`${time}-${key}`}>
        <label>{key}:</label><span>{` ${JSON.stringify(value, null, 2)}`}</span>
      </div>
    ))

    return (
      <tr>
        <td>
          {time}
        </td>
        <td>
          {system}
        </td>
        <td>
          {detailsList}
        </td>
      </tr>
    )
  }
}

class Logs extends Component {
  static propTypes = {
    loadLogsPage: PropTypes.func.isRequired,
    logs: PropTypes.array.isRequired
  };

  componentWillMount () {
    this.props.loadLogsPage()
  }

  componentDidUpdate () {
    const node = ReactDOM.findDOMNode(this)
    const container = node.getElementsByClassName('textarea-panel')[0]

    container.scrollTop = container.scrollHeight + 30
  }

  render () {
    const logs = this.props.logs.map(({time, system, ...details}) => (
      <LogEntry time={time} system={system} details={details}/>
    ))

    return (
      <Row>
        <Col sm={10} smOffset={1} className={'logs'}>
          <h3>{i18n.t('Event Log')}</h3>
          <div className='textarea-panel'>
            <Table responsive>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>System</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs}
              </tbody>
            </Table>
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
