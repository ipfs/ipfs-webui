import React from 'react'
import { actions } from '../../bundles/files'
import ErrorIcon from '../../icons/GlyphSmallCancel'

const names = {
  [actions.FETCH]: 'fetching',
  [actions.MOVE]: 'moving',
  [actions.COPY]: 'copying',
  [actions.DELETE]: 'deleting',
  [actions.MAKE_DIR]: 'creating a folder',
  [actions.WRITE]: 'adding a file',
  [actions.DOWNLOAD_LINK]: 'downloading a file',
  [actions.ADD_BY_PATH]: 'adding a path'
}

export default function Errors ({ errors = [], onDismiss }) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className='br1 f6 relative mb2 white pr2 pl2 pb2' style={{ backgroundColor: 'rgba(243, 97, 73, 0.8)' }}>
      <ErrorIcon onClick={onDismiss} className='pointer fill-white absolute w2 h2 right-0 top-0' />
      {errors.map((e, index) => (
        <div key={index}>
          <p className='pv2 ma0'>An error occurred while <strong>{names[e.type]}</strong>.</p>
          <div className='pa2 monospace word-wrap' style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {e.error.toString()}
          </div>
        </div>
      ))}
    </div>
  )
}
