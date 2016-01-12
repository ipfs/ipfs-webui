import React, {Component} from 'react'
import i18n from '../utils/i18n.js'

export
default class ConfigView extends Component {
  state = {
    body: JSON.stringify(this.props.config, null, 2),
    error: null,
    saving: false,
    saved: false
  };

  static displayName = 'ConfigView';
  static propTypes = {
    config: React.PropTypes.object,
    ipfs: React.PropTypes.object
  };

  componentDidMount () {
    this.updateHeight()
  }

  updateHeight = () => {
    const el = this.refs['config-textarea']
    el.height('1px')
    el.height(el.get(0).scrollHeight)
  };

  handleChange (event) {
    const body = event.target.value
    let error
    this.updateHeight()

    try {
      JSON.parse(body)
    } catch (e) {
      error = e.message
    }

    this.setState({
      error,
      body
    })
  }

  save (event) {
    this.setState({
      saving: true
    })

    this.props.ipfs.config.replace(new Buffer(this.state.body), err => {
      let newState = {
        saving: false
      }
      if (err) {
        newState.error = err.message
      } else {
        newState.saved = true
        setTimeout(() => this.setState({
          saved: false
        }), 4000)
      }
      this.setState(newState)
    })
  }

  render () {
    const buttonClass = 'btn btn-success pull-right' + ((this.state.error || this.state.saving || this.state.saved) ? ' disabled' : '')
    const buttons = (
      <div className='controls'>
        <button className={buttonClass} onClick={this.save.bind(this)}>
          <i className={'fa ' + (this.state.saved ? 'fa-check' : 'fa-save')}></i>&nbsp;
          {this.state.saving ? i18n.t('Saving...') : this.state.saved ? i18n.t('Saved') : i18n.t('Save')}
        </button>
        <button className='btn btn-primary pull-right' onClick={() => this.setState({body: JSON.stringify(this.props.config, null, 2), error: null})}>
          <i className='fa fa-recycle'></i>&nbsp;
          {i18n.t('Reset')}
        </button>
        <div className='clear'/>
      </div>
    )

    let error
    if (this.state.error) {
      error = (
        <div>
          <span className='text-danger pull-left'>
            <strong>{i18n.t('Error in config:')}</strong>
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
          <textarea ref='config-textarea' className='panel-inner' spellCheck='false' onChange={this.handleChange.bind(this)} value={this.state.body} />
        </div>
        {error}
        {buttons}
        <div style={{height: '50px'}} />
        <br/>
      </div>
    )
  }
}
