import React, {Component} from 'react'
import TextArea from 'react-textarea-autosize'

export
default class ConfigText extends Component {
  static displayName = 'ConfigText';

  static propTypes = {
    // Dispatch
    saveDraft: React.PropTypes.func.isRequired,
    markSaved: React.PropTypes.func.isRequired,
    // State
    draft: React.PropTypes.string.isRequired,
    saved: React.PropTypes.bool.isRequired
  };

  handleChange = (event) => {
    const body = event.target.value
    this.props.saveDraft(body)

    if (this.props.saved) {
      this.props.markSaved(false)
    }
  }

  render () {
    return (
      <div className='textarea-panel panel panel-default padded'>
        <TextArea
          className='panel-inner'
          spellCheck='false'
          onChange={this.handleChange}
          value={this.props.draft}
        />
      </div>
    )
  }
}
