import React, { Component } from 'react'
import i18n from '../utils/i18n.js'
import {Table, Tooltip, OverlayTrigger} from 'react-bootstrap'

function getExtention (name, defaultExt = '?') {
  if (!name) {
    return defaultExt
  }

  const ext = name.split('.').pop()

  if (ext === name) {
    return defaultExt
  } else {
    return ext.toUpperCase()
  }
}

export default class FileList extends Component {
  render () {
    var files = this.props.files
    var className = 'table-hover filelist'
    if (this.props.namesHidden) {
      className += ' filelist-names-hidden'
    }

    return (
      <Table responsive className={className}>
        <thead>
          <tr>
            <th>{i18n.t('Type')}</th>
            <th className='filelist-name'>{i18n.t('Name')}</th>
            <th className='id-cell'>{i18n.t('ID')}</th>
            <th className='action-cell'>{i18n.t('Actions')}</th>
          </tr>
        </thead>
        <tbody>
        {files ? files.map(file => {
          if (typeof file === 'string') {
            file = { id: file }
          }

          var dagPath = `#/objects/${file.id}`
          var gatewayPath = `${this.props.gateway}/ipfs/${file.id}`
          var unpin = (e) => {
            e.preventDefault()
            this.props.ipfs.pin.remove(file.id, {r: true}, function (err, res) {
              console.log(err, res)
            })
          }

          return (
            <FileItem {...{gatewayPath, dagPath, file, unpin}} />
          )
        }) : void 0}
        </tbody>
      </Table>
    )
  }
}

FileList.propTypes = {
  ipfs: React.PropTypes.object,
  files: React.PropTypes.array,
  namesHidden: React.PropTypes.bool,
  gateway: React.PropTypes.string
}

const FileItem = ({gatewayPath, dagPath, file, unpin}) => {
  var type = getExtention(file.name)
  var tooltip = (
    <Tooltip id={file.id}>{i18n.t('Remove')}</Tooltip>
  )

  return (
    <tr className='webui-file' data-type={file.type} key={file.id}>
      <td><span className='type'>{type}</span></td>
      <td className='filelist-name'><a target='_blank' href={gatewayPath}>{file.name}</a></td>
      <td className='id-cell'><code>{file.id}</code></td>
      <td className='action-cell'>
        <a target='_blank' href={gatewayPath}>{i18n.t('RAW')}</a>
        <span className='separator'>|</span>
        <a href={dagPath}>{i18n.t('DAG')}</a>
        <span className='separator'>|</span>
        <a href='#' onClick={unpin}>
          <OverlayTrigger placement='right' overlay={tooltip}>
            {/* The block element is required otherwise the overlay is *over* the icon */}
            <div style={{display: 'inline-block'}}><i className='fa fa-remove'></i></div>
          </OverlayTrigger>
        </a>
      </td>
    </tr>
  )
}

