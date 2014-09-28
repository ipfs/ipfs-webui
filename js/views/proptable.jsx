var React = require('react')
var Table = require('react-bootstrap/Table')

module.exports = React.createClass({

  render: function() {
    console.log(this.props.table)
    return (
      <Table responsive>
        <tbody>
          {this.props.table.map(function(val) {
            return (
              <tr>
                <td className="text-left"><strong>{val[0]}</strong></td>
                <td className="text-right">{val[1]}</td>
              </tr>
            )
          })}
          {this.props.children}
        </tbody>
      </Table>
    )

  }
})
