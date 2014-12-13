var React = require('react')
var addr = require('./typography.jsx').addr
var Editable = require('./editable.jsx')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      body: JSON.stringify(this.props.config, null, '\t'),
      error: null,
      saving: false,
      saved: false
    }
  },

  handleChange: function(e) {
    var text = e.target.value
    var error

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

  save: function(e) {
    var t = this
    t.setState({
      body: t.state.body,
      saving: true
    })

    console.log(t.state.body)

    t.props.ipfs.config.replace(new Buffer(t.state.body), function(err) {
      var newState = { saving: false }
      if(err) newState.error = err.message
      else {
        newState.saved = true
        setTimeout(function() {
          t.setState({ saved: false })
        }, 4000)
      }
      t.setState(newState)
    })
  },

  render: function() {
    var buttonClass = 'btn btn-success'
    if(this.state.error || this.state.saving || this.state.saved)
      buttonClass += ' disabled'

    var error = null
    if(this.state.error) {
      error = (
        <div>
          <span className="text-danger">
            <strong>Error in config: </strong>
            <span>{this.state.error}</span>
          </span>
          <br/><br/>
        </div>
      )
    }

    return (
      <div className="webui-config">
        <h3>Config</h3>
        <br/>
        <div className="panel panel-default padded" style={{height: '600px'}}>
          <textarea className="panel-inner" onChange={this.handleChange}>{this.state.body}</textarea>
        </div>
        {error}
        <button className={buttonClass} onClick={this.save}>
          <i className={'fa ' + (this.state.saved ? 'fa-check' : 'fa-save')}></i>&nbsp;
          {this.state.saving ? 'Saving...' : this.state.saved ? 'Saved' : 'Save'}
        </button>
        <div style={{height: '50px'}}></div>
      </div>
    )
  }
})
