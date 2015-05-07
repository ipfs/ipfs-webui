var React = require('react')
var $ = require('jquery')

var ConfigView = React.createClass({
  displayName: 'ConfigView',
  propTypes: {
    config: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      body: JSON.stringify(this.props.config, null, '\t'),
      error: null,
      saving: false,
      saved: false
    }
  },

  reset: function () {
    this.setState({
      body: JSON.stringify(this.props.config, null, '\t'),
      error: null
    })
  },

  componentDidMount: function () {
    this.updateHeight()
  },

  updateHeight: function () {
    var el = $(this.getDOMNode()).find('textarea')
    el.height('1px')
    el.height(el.get(0).scrollHeight)
  },

  handleChange: function (e) {
    var text = e.target.value
    var error

    this.updateHeight()

    try {
      JSON.parse(text)
    } catch(e) {
      error = e.message
    }

    this.setState({
      error: error,
      body: text
    })
  },

  save: function (e) {
    var t = this
    t.setState({
      body: t.state.body,
      saving: true
    })

    console.log(t.state.body)

    t.props.ipfs.config.replace(new Buffer(t.state.body), function (err) {
      var newState = { saving: false }
      if (err) {
        newState.error = err.message
      } else {
        newState.saved = true
        setTimeout(function () {
          t.setState({ saved: false })
        }, 4000)
      }
      t.setState(newState)
    })
  },

  render: function () {
    var buttonClass = 'btn btn-success pull-right'
    if (this.state.error || this.state.saving || this.state.saved) {
      buttonClass += ' disabled'
    }

    var buttons = (
      <div className='controls'>
        <button className={buttonClass} onClick={this.save}>
          <i className={'fa ' + (this.state.saved ? 'fa-check' : 'fa-save')}></i>&nbsp;
          {this.state.saving ? 'Saving...' : this.state.saved ? 'Saved' : 'Save'}
        </button>
        <button className='btn btn-primary pull-right' onClick={this.reset}>
          <i className='fa fa-recycle'></i>&nbsp;
          Reset
        </button>
        <div className='clear'></div>
      </div>
    )

    var error = null
    if (this.state.error) {
      error = (
        <div>
          <span className='text-danger pull-left'>
            <strong>Error in config: </strong>
            <span>{this.state.error}</span>
          </span>
        </div>
      )
    }

    return (
      <div className='webui-config'>
        <h3>Config</h3>
        <br/>
        {error}
        {buttons}
        <div className='textarea-panel panel panel-default padded'>
          <textarea className='panel-inner' spellCheck='false' onChange={this.handleChange} value={this.state.body} />
        </div>
        {error}
        {buttons}
        <div style={{height: '50px'}}></div>
        <br/>
      </div>
    )
  }
})

module.exports = ConfigView
