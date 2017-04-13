import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export
default class Icon extends Component {
  static displayName = 'Icon';
  static propTypes = {
    glyph: PropTypes.string.isRequired,
    large: PropTypes.bool
  };
  render () {
    const className = classNames('icon', 'fa', `fa-${this.props.glyph}`, {
      'fa-lg': this.props.large
    })
    return <span className={className} aria-hidden='true' />
  }
}
