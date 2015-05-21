var React = require('react')
var Link = require('react-router').Link
var upath = require('../utils/path.js')

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
        <Link className='btn btn-primary' to='objects' params={{tab: 'object', path: parent.urlify()}}>
          <i className='fa fa-arrow-up'></i> Parent object
        </Link>
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
              if (link.Name) {
                path = t.props.path.append(link.Name).urlify()
              } else { // support un-named links
                path = upath.parse(link.Hash).urlify()
              }

              return (
                <tr>
                  <td>
                    <Link to='objects' params={{tab: 'object', path: path}}>
                      {link.Name}
                    </Link>
                  </td>
                  <td>
                    <Link to='objects' params={{tab: 'object', path: path}}>
                      {link.Hash}
                    </Link>
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
        <Link to='objects' params={{tab: 'object', path: this.props.permalink.urlify()}}>
          {this.props.permalink.toString()}
        </Link>
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
        <div className='row'>
          <h4>Object</h4>
          <div className='link-buttons'>
            {parentlink}
            <a href={this.props.gateway + this.props.path} target='_blank' className='btn btn-info btn-second'>RAW</a>
            <a href={this.props.gateway + this.props.path + '?dl=1'} target='_blank' className='btn btn-second'>Download</a>
            <button className='btn btn-third hidden'><i className='fa fa-lg fa-thumb-tack'></i></button>
          </div>
          <br/>
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
      </div>
    )
  }
})

module.exports = ObjectView
