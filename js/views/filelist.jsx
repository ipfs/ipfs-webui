var React = require('react')
var Table = require('react-bootstrap/Table')
var copier = require('./copier.jsx')

module.exports = React.createClass({

  componentDidMount: function() {
    $(this.getDOMNode()).find('[data-toggle="tooltip"]').tooltip()
  },

  render: function() {
    var files = this.props.files
    var className = "table-hover filelist"
    if(this.props.namesHidden) className += ' filelist-names-hidden'

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
        {files ? files.map(function(file) {
          if(typeof file === 'string') file = { id: file }

          var type = '?'
          if(file.name) {
            var lastDot = file.name.lastIndexOf('.')
            if(lastDot !== -1) type = file.name.substr(lastDot+1, 4).toUpperCase()
          }

          // TODO: get gateway path from config instead of using hardcoded localhost:8080
          var gatewayPath = 'http://localhost:8080/ipfs/' + file.id
          var dagPath = '#/objects/' + file.id
          return (
            <tr className="webui-file" data-type={file.type}>
              <td><span className="type">{type}</span></td>
              <td className="filelist-name"><a target="_blank" href={gatewayPath}>{file.name}</a></td>
              <td className="id-cell"><code>{file.id}</code>&nbsp;<copier copyText={file.id}><i className="fa fa-copy"></i></copier></td>
              <td className="action-cell">
                <a target="_blank" href={gatewayPath}>RAW</a>
                <span className="separator">|</span>
                <a href={dagPath}>DAG</a>
                <span className="separator">|</span>
                <a><i className="fa fa-thumb-tack" data-toggle="tooltip" data-placement="right" title="" data-original-title="Unpin"></i></a>
              </td>
            </tr>
          )
        }) : void 0}
        </tbody>
      </Table>
    )
  }
})
