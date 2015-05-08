var React = require('react')
var $ = require('jquery')

var MAXSIZE = 1000

var Logs = React.createClass({
  displayName: 'Logs',
  propTypes: {
    ipfs: React.PropTypes.object,
    host: React.PropTypes.string
  },
  getInitialState: function () {
    var t = this
    var req = this.props.ipfs.log.tail(function (err, stream) {
      if (err) return console.error(err)

      var container = $(t.getDOMNode()).find('.textarea-panel').get(0)

      stream.on('data', function (chunk) {
        var parts = chunk.toString().split('}')
        var buf = ''

        parts.forEach(function (part) {
          buf += part + '}'
          try {
            var obj = JSON.parse(buf)
            t.state.log.push(obj)
            if (t.state.log.length > MAXSIZE) t.state.log.shift()
            t.setState({ log: t.state.log, nonce: t.state.nonce + 1 })
            if (t.state.tailing) container.scrollTop = container.scrollHeight
          } catch(e) {}
        })
      })
    })

    return {
      log: [],
      tailing: true,
      nonce: 0,
      request: req
    }
  },

  componentWillUnmount: function () {
    this.state.request.destroy()
  },

  clear: function () {
    this.setState({ log: [] })
  },

  toggleTail: function () {
    this.setState({ tailing: !this.state.tailing })
  },

  getUrl: function () {
    return 'http://' + this.props.host + '/api/v0/log/tail?enc=text'
  },

  render: function () {
    var buttons = (
      <div className='buttons'>
        <button className='btn btn-second' onClick={this.clear}>Clear</button>
        <button className={'btn btn-second ' + (this.state.tailing ? 'active' : '')}
          data-toggle='button' aria-pressed={this.state.tailing} onClick={this.toggleTail}>Tail</button>
      </div>
    )

    return (
    <div className='row'>
      <div className='col-sm-10 col-sm-offset-1 webui-logs'>
        <h3>Event Log</h3>
        <div className='actions'>{buttons}</div>
        <br/>

        <div className='textarea-panel panel panel-default padded' style={{height: '600px'}}>
          {this.state.log.map(function (event) {
            return <pre key={event.time}>{JSON.stringify(event, null, '  ')}</pre>
          })}
        </div>

        <div className='pull-right'>{buttons}</div>
        <br/>
      </div>
    </div>
    )
  }
})

module.exports = Logs
