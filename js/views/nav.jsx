var React = require('react')
var Link = require('react-router').Link

module.exports = React.createClass({

  render: function() {
    return (
      <div className="row">
        <ul id="side" className="nav nav-sidebar">
          <li className="active">
            <Link className="link" to="home">
              <span className="icon glyphicon glyphicon-record" aria-hidden="true"></span> Home
            </Link>
          </li>
          <li>
            <Link className="link" to="connections">
              <span className="icon glyphicon glyphicon-globe" aria-hidden="true"></span> Connections
            </Link>
          </li>
          <li>
            <Link className="link" to="files">
              <span className="icon glyphicon glyphicon-file" aria-hidden="true"></span> Files
            </Link>
          </li>
          <li>
            <Link className="link" to="objects">
              <span className="icon glyphicon glyphicon-list-alt" aria-hidden="true"></span> DAG
            </Link>
          </li>
          <li>
            <Link className="link" to="config">
              <span className="icon glyphicon glyphicon-cog" aria-hidden="true"></span> Config
            </Link>
          </li>
          <li>
            <Link className="link" to="logs">
              <span className="icon glyphicon glyphicon-list" aria-hidden="true"></span> Logs
            </Link>
          </li>
        </ul>
      </div>
    )
  }
})
