import React, {Component} from 'react'
import Table from 'react-bootstrap/lib/Table'
import {addr} from './typography'

export
default class TableView extends Component {
  static displayName = 'Table';
  static propTypes = {
    table: React.PropTypes.array,
    children: React.PropTypes.array
  };

  render () {
    return (
      <Table responsive>
        <tbody>
          {this.props.table.map(val => {
            return <tr><td>{addr(val)}</td></tr>
          })}
          {this.props.children}
        </tbody>
      </Table>
    )
  }
}
