import React, {PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'
import {Table} from 'react-bootstrap'
import pretty from 'prettysize'

import Icon from '../../views/icon'

function renderType (type) {
  if (type === 'directory') return <Icon glyph='folder' large />
  return <Icon glyph='file' large />
}

class CreateDirInput extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    onKeyEnter: PropTypes.func
  };

  static defaultProps = {
    value: '',
    onChange () {},
    onEnter () {}
  };

  _onKeyPress = (event) => {
    if (event.which === 13) {
      event.preventDefault()
      this.props.onKeyEnter()
    }
  };

  componentDidMount () {
    ReactDOM.findDOMNode(this.refs.tmpDirInput).focus()
  }

  render () {
    return (
      <tr className='file-row tmp-dir-row'>
        <td>
          <Icon glyph='folder' large />
          <input
            ref='tmpDirInput'
            type='text'
            value={this.props.value}
            onChange={this.props.onChange}
            onKeyPress={this._onKeyPress}/>
        </td>
        <td>
        </td>
      </tr>
    )
  }
}

class Row extends Component {
  static propTypes = {
    file: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
  };

  _onClick = (event) => {
    this.props.onClick(this.props.file)
  };

  render () {
    const {file} = this.props
    return (
      <tr onDoubleClick={this._onClick} className='file-row'>
        <td>
          {renderType(file.Type)}
          {file.Name}
        </td>
        <td>
          {file.Type === 'directory' ? '-' : pretty(file.Size)}
        </td>
      </tr>
    )
  }
}

export default class Tree extends Component {
  static propTypes = {
    files: PropTypes.array,
    tmpDir: PropTypes.shape({
      root: PropTypes.string.isRequired,
      name: PropTypes.string
    }),
    onRowClick: PropTypes.func,
    onTmpDirChange: PropTypes.func.isRequired,
    onCreateDir: PropTypes.func.isRequired
  };

  static defaultProps = {
    files: [],
    onRowClick () {}
  };

  _onTmpDirChange = ({target}) => {
    this.props.onTmpDirChange(target.value)
  };

  render () {
    let tmpDir
    if (this.props.tmpDir) {
      tmpDir = (
        <CreateDirInput
          onChange={this._onTmpDirChange}
          value={this.props.tmpDir.name}
          onKeyEnter={this.props.onCreateDir}
        />
      )
    }

    const files = this.props.files.map((file, i) => (
      <Row
        key={i}
        file={file}
        onClick={this.props.onRowClick}/>
    )).concat([tmpDir])

    return (
      <Table responsive className='files-tree'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {files}
        </tbody>
      </Table>
    )
  }
}
