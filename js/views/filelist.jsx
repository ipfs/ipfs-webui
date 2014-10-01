var React = require('react')
var Table = require('react-bootstrap/Table')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var files = this.props.files

    return (
      <Table responsive className="table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
        {files ? files.map(function(file) {
          return (
            <tr className="webui-file">
              <td><strong>{file.name}</strong></td>
              <td>{addr(file.id)}</td>
            </tr>
          )
        }) : void 0}
        </tbody>
      </Table>
    )
  }
})
