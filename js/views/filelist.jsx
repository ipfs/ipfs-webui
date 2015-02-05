var React = require('react')
var Table = require('react-bootstrap/Table')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var files = this.props.files
    var className = "table-hover filelist"
    if(this.props.namesHidden) className += ' filelist-names-hidden'

    return (
      <Table responsive className={className}>
        <thead>
          <tr>
            <th></th>
            <th className="filelist-name">Name</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
        {files ? files.map(function(file) {
          if(typeof file === 'string') file = { id: file }

          // TODO: get gateway path from config instead of using hardcoded localhost:8080
          return (
            <tr className="webui-file" data-type={file.type}>
              <td><a target="_blank" href={'http://localhost:8080/ipfs/'+file.id}><i className="fa fa-file"></i></a></td>
              <td className="filelist-name"><a target="_blank" href={'http://localhost:8080/ipfs/'+file.id}>{file.name}</a></td>
              <td><a target="_blank" href={'http://localhost:8080/ipfs/'+file.id}>{addr(file.id)}</a></td>
            </tr>
          )
        }) : void 0}
        </tbody>
      </Table>
    )
  }
})
