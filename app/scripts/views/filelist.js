import React, { Component } from 'react'
import i18n from '../utils/i18n.js'
import {Table} from 'react-bootstrap'
import FileItem from './fileitem'
import Debug from 'debug'

const debug = Debug('ipfs:views:filelist')

export default class FileList extends Component {
  static propTypes = {
    ipfs: React.PropTypes.object,
    files: React.PropTypes.array,
    namesHidden: React.PropTypes.bool,
    gateway: React.PropTypes.string
  }

  render () {
    const files = this.props.files
    let className = 'table-hover filelist'

    if (this.props.namesHidden) {
      className += ' filelist-names-hidden'
    }

    const createFile = file => {
      if (typeof file === 'string') {
        file = { id: file }
      }

      const dagPath = `#/objects/${file.id}`
      const gatewayPath = `${this.props.gateway}/ipfs/${file.id}`
      const unpin = (e) => {
        e.preventDefault()
        this.props.ipfs.pin.remove(file.id, {r: true}, (err, res) => {
          if (err) {
            // TODO Handle error and display to the user
            error(err)
          }
        })
      }

      return (
        <FileItem key={file.id} {...{gatewayPath, dagPath, file, unpin}} />
      )
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
          {files ? files.map(createFile) : void 0}
        </tbody>
      </Table>
    )
  }
}
