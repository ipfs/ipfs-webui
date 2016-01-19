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
      title: 'logs',
      icon: 'list'
    }]

    return (
        <div className='row'>
          <ul id='side' className='nav nav-sidebar'>
              {
                tabs.map((tab, idx) => {
                  return (
                    <li key={idx}>
                      <NavItem title={tab.title} url={tab.url ? tab.url : ('/' + tab.title)} icon={tab.icon} />
                    </li>
                  )
                })
              }
          </ul>
        </div>
    )
  }
}
