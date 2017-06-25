import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {LinkContainer} from 'react-router-bootstrap'
import {NavItem} from 'react-bootstrap'

import i18n from '../utils/i18n'
import Icon from './icon'

class NavigationItem extends Component {
  render () {
    return (
      <LinkContainer
        className='link'
        to={this.props.url}
        onlyActiveOnIndex={false}>
        <NavItem>
          <Icon glyph={this.props.icon} /> {i18n.t(this.props.title)}
        </NavItem>
      </LinkContainer>
    )
  }
}

NavigationItem.displayName = 'NavItem'

NavigationItem.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired
}

export default NavigationItem
