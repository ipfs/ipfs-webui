import React, {
  Component, PropTypes
}
from 'react'
import ReactDOM from 'react-dom'
import i18n from '../utils/i18n.js'
import {
  Row, Col
}
from 'react-bootstrap'

const MAXSIZE = 1000

export
default class Logs extends Component {
  static propTypes = {
    ipfs: PropTypes.object,
    host: PropTypes.string
  };

  state = {
    log: [],
    tailing: true,
    nonce: 0,
    request: null,
    stream: null
  };

  _onLogData = chunk => {
    this.setState(oldState => {
      let log = oldState.log

      if (log.length > MAXSIZE) log.shift()

      log.push(chunk)

      return {
        log,
        nonce: oldState.nonce + 1
      }
    })
  };

  componentWillMount () {
    const request = this.props.ipfs.log.tail((err, stream) => {
      if (err) return console.error(err)
      stream.on('data', this._onLogData)
      this.setState({
        stream
      })
    })

    this.setState({
      request
    })
  }

  componentWillUnmount () {
    if (this.state.request) {
      this.state.request.destroy()
      this.setState({
        request: null
      })
    }

    if (this.state.stream) {
      this.state.stream.removeAllListeners('data')
      this.setState({
        stream: null
      })
    }
  }

  componentDidUpdate () {
    if (this.state.tailing) {
      const node = ReactDOM.findDOMNode(this)
      const container = node.getElementsByClassName('textarea-panel')[0]

      container.scrollTop = container.scrollHeight + 30
    }
  }

  render () {
    const buttons = (
      <div className='buttons'>
        <button className='btn btn-second' onClick={() => this.setState({ log: [] })}>{i18n.t('Clear')}</button>
        <button
          className={'btn btn-second ' + (this.state.tailing ? 'active' : '')}
          data-toggle='button'
          aria-pressed={this.state.tailing}
          onClick={() => this.setState({ tailing: !this.state.tailing })}
        >
          {i18n.t('Tail')}
        </button>
      </div>
    )

    return (
      <Row>
        <Col sm={10} smOffset={1} className={'webui-logs'}>
          <h3>{i18n.t('Event Log')}</h3>
          <div className='actions'>{buttons}</div>
          <br/>
          <div className='textarea-panel panel panel-default padded'>
            {this.state.log.map(event => (
              <pre key={event.time}>{JSON.stringify(event, null, '  ')}</pre>
            ))}
          </div>
          <div className='pull-right'>{buttons}</div>
          <br/>
        </Col>
      </Row>
    )
  }
}
