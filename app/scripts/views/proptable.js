import React from 'react'
import Table from 'react-bootstrap/lib/Table'

export default React.createClass({
  displayName: 'PropTable',
  propTypes: {
    table: React.PropTypes.array,
    children: React.PropTypes.array
  },
  render: function () {
    return (
      <Table responsive>
        <tbody>
          {this.props.table.map(function (val) {
            return (
              <tr>
                <td className='text-left'><strong>{val[0]}</strong></td>
                <td className='text-right'>{val[1]}</td>
              </tr>
            )
          })}
          {this.props.children}
        </tbody>
      </Table>
    )
  }
})
