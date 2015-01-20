var React = require('react')
var Link = require('react-router').Link

module.exports = React.createClass({

  render: function() {
    return (
      <ul className="nav nav-tabs" style={{"margin-bottom": "60px"}}>
        <li><Link to="home"><i className="fa fa-desktop"></i> Home</Link></li>
        <li><Link to="connections"><i className="fa fa-share-alt"></i> Connections</Link></li>
        <li><Link to="files"><i className="fa fa-copy"></i> Files</Link></li>
        <li><Link to="objects"><i className="fa fa-cubes"></i> Objects</Link></li>
        <li><Link to="bitswap"><i className="fa fa-exchange"></i> Bitswap</Link></li>
        <li><Link to="routing"><i className="fa fa-cloud"></i> Routing</Link></li>
        <li><Link to="config"><i className="fa fa-gear"></i> Config</Link></li>
        <li><Link to="logs"><i className="fa fa-list"></i> Logs</Link></li>
      </ul>
    )
  }
})
