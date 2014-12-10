var React = require('react')
var Link = require('react-router').Link
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    // convert from base64 length to real length
    var size = Math.floor(this.props.Data.length * 4/3)
    var data = 'data:text/plain;base64,' + this.props.Data.substr(0, 10000)

    return (
      <div className="webui-object">
        <h4>Links</h4>
        <div className="panel panel-default">
          <div className="table-responsive">
            <table className="table table-hover filelist">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hash</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
              {this.props.Links.map(function(link) {
                var path = '/objects/' + link.Hash

                return <tr>
                  <td><Link to="object" params={{hash: link.Hash}}>{link.Name}</Link></td>
                  <td><Link to="object" params={{hash: link.Hash}}>{addr(link.Hash)}</Link></td>
                  <td>{link.Size}</td>
                </tr>
              })}
              </tbody>
            </table>
          </div>
        </div>
        <br/>
        <h4>Data <span className="small">({size} bytes)</span></h4>
        <div className="panel panel-default">
          <iframe src={data} className="panel-inner"></iframe>
        </div>
      </div>
    )
  }
})
