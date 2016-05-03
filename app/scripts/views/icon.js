import React, {Component} from 'react'
import classNames from 'classnames'

export
default class Icon extends Component {
  static displayName = 'Icon';
  static propTypes = {
    glyph: React.PropTypes.string.isRequired,
    large: React.PropTypes.bool
  };
  render () {
    const className = classNames('icon', 'fa', `fa-${this.props.glyph}`, {
      'fa-lg': this.props.large
    })
    return <span className={className} aria-hidden='true' />
  }
}
