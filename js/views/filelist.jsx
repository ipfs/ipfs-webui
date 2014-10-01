var React = require('react')
var Table = require('react-bootstrap/Table')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var files = this.props.files
    var click = (this.props.click && typeof this.props.click === 'function') ? this.props.click : function(){}

    return (
      <Table responsive className="table-hover">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
        {files ? files.map(function(file) {
          return (
            <tr className="webui-file" data-type={file.type} onClick={click}>
              <td><i className="fa fa-file"></i></td>
              <td>{file.name}</td>
              <td>{addr(file.id)}</td>
            </tr>
          )
        }) : void 0}
        </tbody>
      </Table>
    )
  }
})
