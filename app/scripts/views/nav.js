import React, {Component} from 'react'
import NavItem from './nav-item'

export
default class Nav extends Component {
  static displayName = 'Nav';

  static contextTypes: {
    router: React.PropTypes.object.isRequired
  };

  render () {
    const tabs = [{
      title: 'home',
      icon: 'dot-circle-o'
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
    }]

    return (
      <div className='row'>
        <ul id='side' className='nav nav-sidebar'>
          {
            tabs.map((tab, idx) => {
              const url = tab.url ? tab.url : ('/' + tab.title)
              const title = tab.title.substring(0, 1).toUpperCase() + tab.title.substring(1)
              return (
                <li key={idx}>
                  <NavItem
                    title={title}
                    url={url}
                    icon={tab.icon} />
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}
