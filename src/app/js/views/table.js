import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Table from 'react-bootstrap/lib/Table'
import {addr} from './typography'

class TableView extends Component {
  render () {
    return (
      <Table responsive>
        <tbody>
          {this.props.table.map((val, i) => {
            return <tr key={i}><td>{addr(val)}</td></tr>
          })}
          {this.props.children}
        </tbody>
      </Table>
    )
  }
}

Table.displayName = 'Table'
Table.propTypes = {
  table: PropTypes.array,
  children: PropTypes.array
}

export default TableView
