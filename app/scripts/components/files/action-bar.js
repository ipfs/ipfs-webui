import React, {Component, PropTypes} from 'react'

import Icon from '../../views/icon'

export default class ActionBar extends Component {
  static propTypes = {
    onCreateDir: PropTypes.func.isRequired
  };

  render () {
    return (
      <div className='action-bar'>
        <a onClick={this.props.onCreateDir}>
          <Icon glyph='plus'/> Create Folder
        </a>
      </div>
    )
  }
}
