import React, {Component} from 'react'
import {LinkContainer} from 'react-router-bootstrap'
import {NavItem} from 'react-bootstrap'

import i18n from '../utils/i18n'
import Icon from './icon'

export
default class NavigationItem extends Component {
  static displayName = 'NavItem';
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string.isRequired
  };
  render () {
    return (
      <LinkContainer className='link' to={this.props.url}>
        <NavItem>
          <Icon glyph={this.props.icon} /> {i18n.t(this.props.title)}
        </NavItem>
      </LinkContainer>
    )
  }
}
