import React, {Component, PropTypes} from 'react'
import classNames from 'classnames'
import {isEqual} from 'lodash-es'

export default class Flag extends Component {
  static propTypes = {
    country: PropTypes.string.isRequired,
    square: PropTypes.bool
  };

  static defaultProps = {
    square: false
  };

  shouldComponentUpdate (nextProps) {
    return !isEqual(nextProps, this.props)
  }

  render () {
    const className = classNames(
      'flag-icon',
      `flag-icon-${this.props.country.toLowerCase()}`, {
        'flag-icon-squared': this.props.square
      })

    const style = {
      marginRight: '10px'
    }

    return (
      <span className={className} style={style}></span>
    )
  }
}
