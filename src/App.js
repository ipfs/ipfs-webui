import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import StatsPoller from 'ipfs-stats'
import FilesUtility from 'ipfs-files-utility'

import {
  Menu,
  MenuOption,
  PaneContainer
} from 'ipfs-react-components'

import Files from './panes/Files'
import Info from './panes/Info'
import Peers from './panes/Peers'
import NotFound from './panes/NotFound'

const options = [{
  title: 'Info',
  path: '/',
  icon: 'ipfs'
}, {
  title: 'Files',
  path: '/files',
  icon: 'files'
}, {
  title: 'Peers',
  icon: 'pulse',
  path: '/peers'
},
{
  title: 'Settings',
  path: '/settings',
  icon: 'settings'
}]

class App extends Component {
  constructor (props) {
    super(props)

    this.poller = new StatsPoller(props.api, 3000, console.error)
    this.files = new FilesUtility(props.api)
  }

  render () {
    const menu = []

    options.forEach((option) => {
      menu.push((
        <MenuOption
          key={option.title}
          title={option.title}
          icon={option.icon}
          active={this.props.history.location.pathname === option.path}
          onClick={() => {
            this.props.history.push(option.path)
          }} />
      ))
    })

    return (
      <PaneContainer className='light'>
        <Menu>
          {menu}
        </Menu>

        <Switch>
          <Route exact path='/' component={() => <Info poller={this.poller} />} />
          <Route exact path='/peers' component={() => <Peers poller={this.poller} />} />
          <Route path='/files(.*)' component={(props) => <Files {...props} utility={this.files} />} />

          <Route path='*' component={NotFound} />
        </Switch>
      </PaneContainer>
    )
  }
}

export default withRouter(App)
