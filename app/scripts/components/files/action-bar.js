import React, {Component, PropTypes} from 'react'

import Icon from '../../views/icon'

export default class ActionBar extends Component {
  static propTypes = {
    onAddDirectory: PropTypes.func.isRequired
  };

  render () {
    return (
      <div className='action-bar'>
        <a onClick={this.props.onAddDirectory}>
          <Icon glyph='plus'/> Add Directory
        </a>
      </div>
    )
  }
}
