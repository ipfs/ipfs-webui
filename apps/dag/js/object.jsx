var React = require('react')
var upath = require('ipfs-webui-common').Path
var ipfsapp = require('ipfs-web-app')

var ObjectView = React.createClass({
  displayName: 'ObjectView',
  propTypes: {
    path: React.PropTypes.object,
    permalink: React.PropTypes.object,
    gateway: React.PropTypes.string,
    object: React.PropTypes.object,
    loadPeers: React.PropTypes.func
  },
  render: function () {
    var size = this.props.object.Data.length - 2
    var data = 'data:text/plain;charset=utf8;base64,' + new Buffer(this.props.object.Data.substr(0, 10000), 'utf-8').toString('base64')

    var t = this
    var parent = this.props.path.parent()
    var parentlink = parent ?
        <a className='btn btn-primary pull-right'
           onClick={function () { ipfsapp.link(parent.toString().substr(1)) } }>
          <i className='fa fa-arrow-up'></i> Parent object
        </a>
      : null

    var links = <div className='padded'><strong>This object has no links</strong></div>
    if (this.props.object.Links.length > 0) {
      links = [
        <li className='list-group-item'>
          <strong>Object links</strong>
        </li>,
        <div className='table-responsive links-panel'>
          <table className='table table-hover filelist'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Hash</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
            {this.props.object.Links.map(function (link) {
              var path
              // remove leading / cause we want relative links
              if (link.Name) {
                path = t.props.path.append(link.Name).toString().substr(1)
              } else { // support un-named links
                path = upath.parse(link.Hash).toString().substr(1)
              }

              return (
                <tr>
                  <td>
                    <a href='#' onClick={ function () { ipfsapp.link(path) }}>
                      {link.Name}
                    </a>
                  </td>
                  <td>
                    <a href='#' onClick={ function () { ipfsapp.link(path) } }>
                      <code>{link.Hash}</code>
                    </a>
                  </td>
                  <td>{link.Size}</td>
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>

      ]
    }
    var resolved = this.props.permalink ?
      <li className='list-group-item'>
        <span>permalink: </span>
        <a to='objects' params={{tab: 'object', path: this.props.permalink.urlify()}}>
          {this.props.permalink.toString()}
        </a>
      </li>
      : null

    var displayData = size ?
      [<li className='list-group-item'>
        <p>
          <strong>Object data ({size} bytes)</strong>
        </p>
      </li>,
      <li className='list-group-item data'>
        <iframe src={data} className='panel-inner'></iframe>
      </li>]
      :
      <li className='list-group-item'>
        <strong>This object has no data</strong>
      </li>

    return (
      <div className='webui-object'>
        <div className='clearfix'>
          <h4>
            <div className='link-buttons'>
              <a href={this.props.gateway + this.props.path + '?dl=1'} target='_blank' className='btn btn-second pull-right'>Download</a>
              <a href={this.props.gateway + this.props.path} target='_blank' className='btn btn-info btn-second pull-right'>RAW</a>
              {parentlink}
            </div>
            <div className='header'>Object</div>
          </h4>
        </div>
        <div className='panel panel-default'>
          <ul className='list-group'>
            {links}
            {displayData}
          </ul>
        </div>
        <div className='panel panel-default'>
          {resolved}
        </div>
      </div>
    )
  }
})

module.exports = ObjectView
