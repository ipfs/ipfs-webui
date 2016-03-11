import React, {Component} from 'react'
import {Link} from 'react-router'

import i18n from '../utils/i18n'
import Icon from './icon'

export
default class NavItem extends Component {
  static displayName = 'NavItem';
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string.isRequired
  };
  render () {
    return (
      <Link className='link' to={this.props.url} activeClassName='active'>
        <Icon glyph={this.props.icon} /> {i18n.t(this.props.title)}
      </Link>
    )
  }
}
