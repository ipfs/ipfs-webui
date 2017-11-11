import React from 'react'
import PropTypes from 'prop-types'
import i18n from '../utils/i18n.js'
import {Glyphicon, Tooltip, OverlayTrigger} from 'react-bootstrap'
import {fileExtension} from '../utils/files'

const FileItem = ({gatewayPath, dagPath, file, unpin}) => {
  var type = fileExtension(file.name)
  var tooltip = (
    <Tooltip id={file.id}>{i18n.t('Remove')}</Tooltip>
  )

  return (
    <tr className='webui-file' data-type={file.type}>
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
            <Glyphicon glyph='remove' />
          </OverlayTrigger>
        </a>
      </td>
    </tr>
  )
}

FileItem.prototype.propTypes = {
  gatewayPath: PropTypes.string,
  dagPath: PropTypes.string,
  file: PropTypes.object,
  unpin: PropTypes.func
}

export default FileItem
