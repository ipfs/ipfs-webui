import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Row, Nav} from 'react-bootstrap'

import NavItem from './nav-item'

const tabs = [
  { title: 'home', icon: 'dot-circle-o' },
  { title: 'connections', icon: 'globe' },
  { title: 'files', icon: 'file' },
  { title: 'DAG', url: 'objects', icon: 'list-alt' },
  { title: 'config', icon: 'cog' }
]

class Navigation extends Component {
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
        <Nav id='side' className='nav-sidebar'>
          {items}
        </Nav>
      </Row>
    )
  }
}

Navigation.displayName = 'Nav'

Navigation.contextTypes = {
  router: PropTypes.object.isRequired
}

export default Navigation
