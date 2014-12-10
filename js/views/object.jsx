var React = require('react')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    // convert from base64 length to real length
    var size = Math.floor(this.props.object.Data.length * 4/3)
    var data = 'data:text/plain;base64,' + this.props.object.Data.substr(0, 10000)
    var handleLink = this.props.handleLink

    var back = null
    if(this.props.path.indexOf('/') !== -1) {
      back = (
        <div>
          <button className="btn btn-primary" onClick={this.props.handleBack}>
            <i className="fa fa-arrow-left"></i> Back to parent object
          </button>
        </div>
      )
    }

    return (
      <div className="webui-object">
        {back}
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
              {this.props.object.Links.map(function(link) {
                return <tr>
                  <td><a href="#" data-name={link.Name} data-hash={link.Hash} onClick={handleLink}>{link.Name}</a></td>
                  <td><a href="#" data-name={link.Name} data-hash={link.Hash} onClick={handleLink}>{addr(link.Hash)}</a></td>
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
