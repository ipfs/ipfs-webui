import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class Icon extends Component {
  render () {
    const className = classNames('icon', 'fa', `fa-${this.props.glyph}`, {
      'fa-lg': this.props.large
    })
    return <span className={className} aria-hidden='true' />
  }
}

Icon.displayName = 'Icon'
Icon.propTypes = {
  glyph: PropTypes.string.isRequired,
  large: PropTypes.bool
}

export default Icon
