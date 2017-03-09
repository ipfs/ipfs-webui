import React, {Component} from 'react'
import i18n from '../utils/i18n.js'
import classNames from 'classnames'

export
default class ConfigButtons extends Component {
  static displayName = 'ConfigButtons'

  static propTypes = {
    // Dispatch
    resetDraft: React.PropTypes.func.isRequired,
    saveClick: React.PropTypes.func.isRequired,
    // State
    saving: React.PropTypes.bool.isRequired,
    saved: React.PropTypes.bool.isRequired
  }

  render () {
    const buttonClass = classNames(
      'btn',
      'btn-success',
      'pull-right', {
        disabled: this.props.saving || this.props.saved
      }
    )

    const iconClass = classNames('fa', {
      'fa-check': this.props.saved,
      'fa-save': !this.props.saved
    })

    return (
      <div className='controls'>
        <button className={buttonClass} onClick={this.props.saveClick}>
          <i className={iconClass} />&nbsp;
          {this.props.saving ? i18n.t('Saving...') : this.props.saved ? i18n.t('Saved') : i18n.t('Save')}
        </button>
        <button className='btn btn-primary pull-right' onClick={this.props.resetDraft}>
          <i className='fa fa-recycle' />&nbsp;
          {i18n.t('Reset')}
        </button>
        <div className='clear' />
      </div>
    )
  }
}
