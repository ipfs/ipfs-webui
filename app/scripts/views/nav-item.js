import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {LinkContainer} from 'react-router-bootstrap'
import {NavItem} from 'react-bootstrap'

import i18n from '../utils/i18n'
import Icon from './icon'

export
default class NavigationItem extends Component {
  static displayName = 'NavItem';
  static propTypes = {
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  };
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
