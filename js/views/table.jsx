var React = require('react')
var Table = require('react-bootstrap/Table')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    return (
      <Table responsive>
        <tbody>
          {this.props.table.map(function(val) {
            return (
              <tr><td>{addr(val)}</td></tr>
            )
          })}
          {this.props.children}
        </tbody>
      </Table>
    )

  }
})
