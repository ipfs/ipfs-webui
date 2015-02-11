var React = require('react')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var size = atob(this.props.object.Data).length - 2
    var data = 'data:text/plain;base64,' + this.props.object.Data.substr(0, 10000)
    var handleLink = this.props.handleLink

    var back = null
    var withoutPrefix = this.props.path.replace(/^\/ip[fn]s\//, '')
    var slashIndex = withoutPrefix.indexOf('/')
    if(slashIndex !== -1 && slashIndex !== withoutPrefix.length-1) {
      back = (
        <div>
          <button className="btn btn-primary" onClick={this.props.handleBack}>
            <i className="fa fa-arrow-left"></i> Back to parent object
          </button>
        </div>
      )
    }

    var links = <div className="padded"><span>This object has no links</span></div>
    if(this.props.object.Links.length > 0) {
      links = (
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
                <td><a href="#" data-name={link.Name} data-hash={link.Hash} onClick={handleLink}>{link.Hash}</a></td>
                <td>{link.Size}</td>
              </tr>
            })}
            </tbody>
          </table>
        </div>
      )
    }

    var gatewayPath = this.props.gateway+'/ipfs/'
    return (
      <div className="webui-object">
        <div className="row">
          {back}
          <h4>Links</h4>
          <div className="link-buttons">
            <a href={gatewayPath+this.props.path} target="_blank" className="btn btn-info">RAW</a>
            <a href={gatewayPath+this.props.path+'?dl=1'} target="_blank" className="btn btn-second">Download</a>
            <button className="btn btn-third hidden"><i className="fa fa-lg fa-thumb-tack"></i></button>
          </div>
          <br/>
          <div className="panel panel-default">
            {links}
          </div>
        </div>
        <br/>
        <div className="row">
          <h4>Data <span className="small">({size} bytes)</span></h4>
          <div className="panel panel-default data">
            <iframe src={data} className="panel-inner"></iframe>
          </div>
        </div>
      </div>
    )
  }
})
