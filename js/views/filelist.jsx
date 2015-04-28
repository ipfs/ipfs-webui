var React = require('react')
var Table = require('react-bootstrap/lib/Table')
var copier = require('./copier.jsx')
var _ = require('lodash')
var $ = require('jquery')
require('bootstrap') // attaches to jquery

var FileList = React.createClass({

  componentDidMount: function () {
    $(this.getDOMNode()).find('[data-toggle="tooltip"]').tooltip()
  },

  unpin: function (e) {
    e.preventDefault()
    e.stopPropagation()

    var el = $(e.target)
    var hash = el.attr('data-hash')
    if (!hash) hash = el.parent().attr('data-hash')

    this.props.ipfs.pin.remove(hash, {r: true}, function (err, res) {
      console.log(err, res)
    })
  },

  render: function () {
    var t = this
    var files = this.props.files
    var className = 'table-hover filelist'
    if (this.props.namesHidden) className += ' filelist-names-hidden'

    return (
      <Table responsive className={className}>
        <thead>
          <tr>
            <th>Type</th>
            <th className="filelist-name">Name</th>
            <th className="id-cell">ID</th>
            <th className="action-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
        {files ? _.map(files, function (file) {
          var type = '?'

          if (file.Name) {
            var lastDot = file.Name.lastIndexOf('.')
            if (lastDot !== -1) type = file.Name.substr(lastDot + 1, 4).toUpperCase()
          }

          var gatewayPath = t.props.gateway + '/ipfs/' + file.Hash
          var dagPath = '#/objects/' + file.Hash
          return (
            <tr className="webui-file" data-type={file.type} key={file.Hash}>
              <td><span className="type">{type}</span></td>
              <td className="filelist-name"><a target="_blank" href={gatewayPath}>{file.Name}</a></td>
              <td className="id-cell"><code>{file.Hash}</code>&nbsp;<copier copyText={file.Hash}><i className="fa fa-copy"></i></copier></td>
              <td className="action-cell">
                <a target="_blank" href={gatewayPath}>RAW</a>
                <span className="separator">|</span>
                <a href={dagPath}>DAG</a>
                <span className="separator">|</span>
                <a href="#" onClick={t.unpin} data-hash={file.Hash}><i className="fa fa-remove" data-toggle="tooltip" data-placement="right" title="" data-original-title="Remove"></i></a>
              </td>
            </tr>
          )
        }) : void 0}
        </tbody>
      </Table>
    )
  }
})

module.exports = FileList
