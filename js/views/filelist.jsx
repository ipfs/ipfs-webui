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
        {files.map(function(file) {
          return (
            <tr className="webui-file">
              <td>{addr(file.name)}</td>
              <td>{addr(file.id)}</td>
            </tr>
          )
        })}
        </tbody>
      </Table>
    )
  }
})
