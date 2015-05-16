var React = require('react')
var Link = require('react-router').Link

var Nav = React.createClass({
  displayName: 'Nav',
  render: function () {
    return (
      <div className='row'>
        <ul id='side' className='nav nav-sidebar'>
          <li className='active'>
            <Link className='link' to='home'>
              <span className='icon fa fa-dot-circle-o' aria-hidden='true'></span> Home
            </Link>
          </li>
          <li>
            <Link className='link' to='connections'>
              <span className='icon fa fa-globe' aria-hidden='true'></span> Connections
            </Link>
          </li>
          <li>
            <Link className='link' to='files'>
              <span className='icon fa fa-file' aria-hidden='true'></span> Files
            </Link>
          </li>
          <li>
            <Link className='link' to='objects' params={{tab: 'object'}}>
              <span className='icon fa fa-list-alt' aria-hidden='true'></span> DAG
            </Link>
          </li>
          <li>
            <Link className='link' to='config'>
              <span className='icon fa fa-cog' aria-hidden='true'></span> Config
            </Link>
          </li>
          <li>
            <Link className='link' to='logs'>
              <span className='icon fa fa-list' aria-hidden='true'></span> Logs
            </Link>
          </li>
        </ul>
      </div>
    )
  }
})

module.exports = Nav
