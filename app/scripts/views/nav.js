import React, {Component} from 'react'
import {Row, Nav} from 'react-bootstrap'

import NavBar from './navbar'
import NavItem from './nav-item'

const tabs = [{
  title: 'home',
  icon: 'home'
}, {
  title: 'connections',
  icon: 'globe'
}, {
  title: 'files',
  icon: 'file'
}, {
  title: 'DAG',
  url: 'objects',
  icon: 'list-alt'
}, {
  title: 'config',
  icon: 'cog'
}, {
  title: 'logs',
  icon: 'list'
}]

export default class Navigation extends Component {
  static displayName = 'Nav';

  static contextTypes: {
    router: React.PropTypes.object.isRequired
  };

  render () {
    const items = tabs.map((tab, idx) => {
      const url = tab.url ? tab.url : ('/' + tab.title)
      const title = tab.title.substring(0, 1).toUpperCase() + tab.title.substring(1)
      return (
        <NavItem
          key={idx}
          title={title}
          url={url}
          icon={tab.icon}
        />
      )
    })

    return (
      <Row>
        <NavBar />
        <Nav id='side' bsStyle='pills' stacked>
          {items}
        </Nav>
      </Row>
    )
  }
}
