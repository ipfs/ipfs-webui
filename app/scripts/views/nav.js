var React = require('react')
var Link = require('react-router').Link
var i18n = require('../utils/i18n.js')

var Nav = React.createClass({
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

module.exports = Nav
