import React, {Component, PropTypes} from 'react'
import {FlexTable, FlexColumn} from 'react-virtualized'
import {Button} from 'react-bootstrap'
import {map} from 'lodash'

const DetailsList = ({data}) => {
  const entries = map(data, (value, key) => (
    <div key={key}>
      <strong>{key}:</strong> {value}
    </div>
  ))
  return (
    <div className='details-view'>
      {entries}
    </div>
  )
}

const pad = (val) => {
  let res = val.toString()
  return res.length === 1 ? `0${res}` : res
}

const timestamp = (time) => {
  const d = new Date(time)
  const year = d.getFullYear()
  const month = pad(d.getMonth())
  const day = pad(d.getDay())
  const hour = pad(d.getHours())
  const minute = pad(d.getMinutes())
  const second = pad(d.getSeconds())

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const detailsCellGetter = (dataKey, rowData, columnData) => {
  const {time, system, event, ...details} = rowData
  return details
}

const detailsCellRender = (cellData, cellDataKey, rowData, rowIndex, columnData) => {
  return <DetailsList data={cellData} />
}

export default class LogViewer extends Component {
  static propTypes = {
    list: PropTypes.array
  };

  static defaultProps = {
    list: []
  };

  state = {
    tail: true
  };

  _toggleTail = () => {
    this.setState(({tail}) => {
      return {tail: !tail}
    })
  };

  _noRowsRenderer = () => {
    return (
      <div className='logs-view-empty'>
        No log data to be shown
      </div>
    )
  };

  _getDatum = (index) => {
    const {list} = this.props

    return list[index % list.length]
  };

  _getRowHeight = (index) => {
    const datum = this._getDatum(index)
    const detailsCount = Math.max(Object.keys(datum).length - 5, 0)

    return 50 + detailsCount * 20
  };

  render () {
    const rowsCount = this.props.list.length
    const scrollToIndex = this.state.tail ? this.props.list.length - 1 : undefined

    return (
      <div>
        <div className='button-row'>
          <Button
            bsStyle='info'
            bsSize='small'
            active={this.state.tail}
            onClick={this._toggleTail}
          >
            Tail Log
          </Button>
        </div>
        <FlexTable
          ref='table'
          className='log-viewer'
          headerHeight={40}
          height={500}
          noRowsRenderer={this._noRowsRenderer}
          rowsCount={rowsCount}
          rowHeight={this._getRowHeight}
          rowGetter={this._getDatum}
          rowClassName='log-entry'
          scrollToIndex={scrollToIndex}
        >
          <FlexColumn
            label='Timestamp'
            cellDataGetter={(_, {time}, __) => timestamp(time)}
            cellClassName='log-entry-time'
            dataKey='time'
            width={150}
          />
          <FlexColumn
            label='Event'
            cellClassName='log-entry-event'
            cellDataGetter={(_, {system, event}, __) => `${system}.${event}`}
            dataKey='event'
            width={300}
          />
          <FlexColumn
            label='Details'
            cellDataGetter={detailsCellGetter}
            cellRenderer={detailsCellRender}
            dataKey='system'
            width={500}
          />
        </FlexTable>
      </div>
    )
  }
}
