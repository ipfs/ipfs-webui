import React from 'react'
import PropTypes from 'prop-types'

import StrokeShare from '../../icons/StrokeShare'
import StrokePencil from '../../icons/StrokePencil'
import StrokeIpld from '../../icons/StrokeIpld'
import StrokeTrash from '../../icons/StrokeTrash'
import StrokeDownload from '../../icons/StrokeDownload'

export default function ContextMenu (props) {
  return (
    <div style={{borderColor: '#DBE0E3'}} className='sans-serif charcoal ba br2 mw5'>
      <div className='flex pointer items-center pa2 bb' style={{borderColor: '#DBE0E3'}} onClick={props.onDelete}>
        <StrokeTrash className='w2 mr2' fill='#A4BFCC' />
        Delete
      </div>
      <div className='flex pointer items-center pa2 bb' style={{borderColor: '#DBE0E3'}} onClick={props.onRename}>
        <StrokePencil className='w2 mr2' fill='#A4BFCC' />
        Rename
      </div>
      <div className='flex pointer items-center pa2 bb' style={{borderColor: '#DBE0E3'}} onClick={props.onDownload}>
        <StrokeDownload className='w2 mr2' fill='#A4BFCC' />
        Download
      </div>
      <div className='flex pointer items-center pa2 bb' style={{borderColor: '#DBE0E3'}} onClick={props.onInspect}>
        <StrokeIpld className='w2 mr2' fill='#A4BFCC' />
        Inspect
      </div>
      <div className='flex pointer items-center pa2' onClick={props.onShare}>
        <StrokeShare className='w2 mr2' fill='#A4BFCC' />
        Share
      </div>
    </div>
  )
}

ContextMenu.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired
}
