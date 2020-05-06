import React, { useRef, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import anime from 'animejs'
// Icons
// import DocumentIcon from '../../icons/StrokeDocument'
// import FolderIcon from '../../icons/StrokeFolder'
import './FileImportStatus.css'

const FileInput = ({ writeFilesProgress, filesFinished, filesPending, t }) => {
  const progress = useRef(0)

  useEffect(() => {
    const newProgress = writeFilesProgress || 100

    const oldProgress = progress.current

    console.log(oldProgress, newProgress)

    anime({
      targets: progress,
      value: [oldProgress, newProgress],
      easing: 'linear',
      round: 2,
      duration: 100
    })
  }, [writeFilesProgress])

  if (!writeFilesProgress && !filesFinished.length) {
    return null
  }

  console.log(progress.current)

  return (
    <div className='fileImportStatus fixed bottom-1'>
      <div className="card">
        <div className="cardTitle">
          {/* TODO: update */}
          { filesPending.length ? `Importing ${filesPending.length}` : `Imported ${filesFinished.length}`} items
          (<span>{ progress.current } </span>%)
        </div>
      </div>
    </div>
  )
}

FileInput.propTypes = {
  writeFilesProgress: PropTypes.number,
  t: PropTypes.func.isRequired
}

export default connect(
  'selectWriteFilesProgress',
  'selectFilesFinished',
  'selectFilesPending',
  withTranslation('files')(FileInput)
)
