import React, {Component} from 'react'
import i18n from '../utils/i18n.js'
import classNames from 'classnames'

export
default class ConfigView extends Component {
  static displayName = 'ConfigView';
  static propTypes = {
    config: React.PropTypes.object,
    ipfs: React.PropTypes.object
  };

  state = {
    body: JSON.stringify(this.props.config, null, 2),
    error: null,
    saving: false,
    saved: false,
    height: 0
  };

  updateHeight = () => {
    const el = this.refs.configTextarea
    this.setState({height: el.scrollHeight})
  };

  componentDidMount () {
    this.updateHeight()
  }

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

    const body = JSON.parse(this.state.body)

    this.props.ipfs.config.replace(body).then(() => {
      let newState = {
        saving: false,
        saved: true
      }

      setTimeout(() => this.setState({
        saved: false
      }), 4000)
      this.setState(newState)
    }).catch((error) => this.setState({error}))
  }

  render () {
    const buttonClass = classNames(
      'btn',
      'btn-success',
      'pull-right', {
        disabled: this.state.error || this.state.saving || this.state.saved
      }
    )

    const iconClass = classNames('fa', {
      'fa-check': this.state.saved,
      'fa-save': !this.state.saved
    })
    const buttons = (
      <div className='controls'>
        <button className={buttonClass} onClick={(event) => this.save(event)}>
          <i className={iconClass} />&nbsp;
          {this.state.saving ? i18n.t('Saving...') : this.state.saved ? i18n.t('Saved') : i18n.t('Save')}
        </button>
        <button className='btn btn-primary pull-right' onClick={() => this.setState({body: JSON.stringify(this.props.config, null, 2), error: null})}>
          <i className='fa fa-recycle' />&nbsp;
          {i18n.t('Reset')}
        </button>
        <div className='clear' />
      </div>
    )

    let error
    if (this.state.error) {
      error = (
        <div>
          <span className='text-danger pull-left'>
            <strong>{i18n.t('Error in config')}</strong>
            <span>{this.state.error}</span>
          </span>
        </div>
      )
    }

    return (
      <div className='webui-config'>
        <h3>{i18n.t('Config')}</h3>
        <br />
        {error}
        {buttons}
        <div className='textarea-panel panel panel-default padded'>
          <textarea
            ref='configTextarea'
            className='panel-inner'
            spellCheck='false'
            style={{height: this.state.height}}
            onChange={(event) => this.handleChange(event)}
            value={this.state.body}
          />
        </div>
        {error}
        {buttons}
        <div style={{height: '50px'}} />
        <br />
      </div>
    )
  }
}
