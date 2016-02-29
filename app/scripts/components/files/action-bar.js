import React, {Component} from 'react'

import Icon from '../../views/icon'

export default class ActionBar extends Component {
  _onAddDirectory = (event) => {

  };

  render () {
    return (
      <div className='action-bar'>
        <a onClick={this._onAddDirectory}>
          <Icon glyph='plus'/> Add Directory
        </a>
      </div>
    )
  }
}
