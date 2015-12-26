import React from 'react'
import {Link} from 'react-router'
import i18n from '../utils/i18n.js'

export default React.createClass({
  displayName: 'Nav',
  render: function () {
    return (
      <div className='row'>
        <ul id='side' className='nav nav-sidebar'>
          <li className='active'>
            <Link className='link' to='home'>
              <span className='icon fa fa-dot-circle-o' aria-hidden='true'></span> {i18n.t('Home')}
            </Link>
          </li>
          <li>
            <Link className='link' to='connections'>
              <span className='icon fa fa-globe' aria-hidden='true'></span> {i18n.t('Connections')}
            </Link>
          </li>
          <li>
            <Link className='link' to='files'>
              <span className='icon fa fa-file' aria-hidden='true'></span> {i18n.t('Files')}
            </Link>
          </li>
          <li>
            <Link className='link' to='objects' params={{tab: 'object'}}>
              <span className='icon fa fa-list-alt' aria-hidden='true'></span> {i18n.t('DAG')}
            </Link>
          </li>
          <li>
            <Link className='link' to='config'>
              <span className='icon fa fa-cog' aria-hidden='true'></span> {i18n.t('Config')}
            </Link>
          </li>
          <li>
            <Link className='link' to='logs'>
              <span className='icon fa fa-list' aria-hidden='true'></span> {i18n.t('Logs')}
            </Link>
          </li>
        </ul>
      </div>
    )
  }
})
