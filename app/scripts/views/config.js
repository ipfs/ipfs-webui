import React from 'react'
import i18n from '../utils/i18n.js'

export default React.createClass({
  displayName: 'ConfigView',
  propTypes: {
    config: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      body: JSON.stringify(this.props.config, null, 2),
      error: null,
      saving: false,
      saved: false,
      height: 0
    }
  },

  reset: function () {
    this.setState({
      body: JSON.stringify(this.props.config, null, 2),
      error: null
    })
  },

  componentDidMount: function () {
    this.updateHeight()
  },

  updateHeight: function () {
    var el = this.refs.textareaConfig
    this.setState({height: el.scrollHeight})
  },

  handleChange: function (e) {
    var text = e.target.value
    var error

    this.updateHeight()

    try {
      JSON.parse(text)
    } catch (e) {
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
          {this.state.saving ? i18n.t('Saving...') : this.state.saved ? i18n.t('Saved') : i18n.t('Save')}
        </button>
        <button className='btn btn-primary pull-right' onClick={this.reset}>
          <i className='fa fa-recycle'></i>&nbsp;
          {i18n.t('Reset')}
        </button>
        <div className='clear'></div>
      </div>
    )

    var error = null
    if (this.state.error) {
      error = (
        <div>
          <span className='text-danger pull-left'>
            <strong>{i18n.t('Error in config:')} </strong>
            <span>{this.state.error}</span>
          </span>
        </div>
      )
    }

    return (
      <div className='webui-config'>
        <h3>{i18n.t('Config')}</h3>
        <br/>
        {error}
        {buttons}
        <div className='textarea-panel panel panel-default padded'>
          <textarea ref='textareaConfig' className='panel-inner' style={{height: this.state.height}} spellCheck='false' onChange={this.handleChange} value={this.state.body} />
        </div>
        {error}
        {buttons}
        <div style={{height: '50px'}}></div>
        <br/>
      </div>
    )
  }
})
