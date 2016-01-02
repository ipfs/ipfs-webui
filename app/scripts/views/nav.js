import React from 'react'

import NavItem from './nav-item'

export default React.createClass({
  displayName: 'Nav',

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  render: function () {
    return (
      <div className='row'>
        <ul id='side' className='nav nav-sidebar'>
          <li>
            <NavItem title='Home' url='/home' icon='dot-circle-o' />
          </li>
          <li>
            <NavItem title='Connections' url='/connections' icon='globe' />
          </li>
          <li>
            <NavItem title='Files' url='/files' icon='file' />
          </li>
          <li>
            <NavItem title='DAG' url='/objects' icon='list-alt' />
          </li>
          <li>
            <NavItem title='Config' url='/config' icon='cog' />
          </li>
          <li>
            <NavItem title='Logs' url='/logs' icon='list' />
          </li>
        </ul>
      </div>
    )
  }
})
