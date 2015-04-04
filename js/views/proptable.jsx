var React = require('react')
var Table = require('react-bootstrap/lib/Table')

var PropTable = React.createClass({
  render: function () {
    return (
      <Table responsive>
        <tbody>
          {this.props.table.map(function (val) {
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

module.exports = PropTable
