import React, { useMemo, useState, useCallback } from 'react'
import filesize from 'filesize'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
// Icons
import DocumentIcon from '../../icons/GlyphDocGeneric'
import FolderIcon from '../../icons/GlyphFolder'
import './FileImportStatus.css'
import GlyphSmallArrows from '../../icons/GlyphSmallArrow'
import GlyphTick from '../../icons/GlyphTick'
import GlyphCancel from '../../icons/GlyphCancel'
import GlyphSmallCancel from '../../icons/GlyphSmallCancel'
import ProgressBar from '../../components/progress-bar/ProgressBar'

const File = (job, t) => {
  const pathsByFolder = job.message.entries.reduce((prev, currentEntry) => {
    const isFolder = currentEntry.path.includes('/')
    if (!isFolder) {
      return [...prev, currentEntry]
    }

    const baseFolder = currentEntry.path.split('/')[0]

    const alreadyExistentBaseFolder = prev.find(previousPath => previousPath.path.startsWith(`${baseFolder}/`))

    if (alreadyExistentBaseFolder) {
      alreadyExistentBaseFolder.count = alreadyExistentBaseFolder.count + 1
      alreadyExistentBaseFolder.size += currentEntry.size

      return prev
    }

    return [...prev, { ...currentEntry, name: baseFolder, count: 1 }]
  }, [])

  return pathsByFolder.map(({ count, name, path, size, progress }) => (
    <li className="flex w-100 bb b--light-gray items-center f6 charcoal" key={ path || name }>
      { count ? <FolderIcon className='fileImportStatusIcon fill-aqua pa1'/> : <DocumentIcon className='fileImportStatusIcon fill-aqua pa1'/> }
      <span className="fileImportStatusName truncate">{ name || path }</span>
      <span className='gray mh2'> |
        { count && (<span> { t('filesImportStatus.count', { count }) } | </span>) }
        <span className='ml2'>{ filesize(size) }</span>
      </span>
      {viewFileStatus(job, progress)}
    </li>
  ))
}

const viewFileStatus = (job, progress) => {
  switch (job.status) {
    case 'Pending': {
      return (<LoadingIndicator complete={ progress === 100 }/>)
    }
    case 'Failed': {
      return (<GlyphCancel className="dark-red w2 ph1" fill="currentColor"/>)
    }
    default: {
      return (<LoadingIndicator complete={true}/>)
    }
  }
}

const LoadingIndicator = ({ complete }) =>
  complete ? <GlyphTick className="green w2 ph1" fill="currentColor"/> : <span className="w2 ph1"/>

export const FileImportStatus = ({ filesFinished, filesPending, filesErrors, doFilesClear, initialExpanded, t }) => {
  const sortedFilesFinished = useMemo(() => filesFinished.sort((fileA, fileB) => fileB.start - fileA.start), [filesFinished])
  const [expanded, setExpanded] = useState(initialExpanded)

  const handleImportStatusClose = useCallback((ev) => {
    doFilesClear()
    ev.stopPropagation() // Prevent setExpanded from being called
  }, [doFilesClear])

  if (!filesFinished.length && !filesPending.length && !filesErrors.length) {
    return null
  }

  const numberOfImportedFiles = !filesFinished.length ? 0 : filesFinished.reduce((prev, finishedFile) => prev + finishedFile.message.entries.length, 0)

  const progress = Math.floor(filesPending.reduce((total, { message: { progress } }) => total + progress, 0) / filesPending.length)

  return (
    <div className='fileImportStatus fixed bottom-1 w-100 flex justify-center' style={{ zIndex: 14, pointerEvents: 'none' }}>
      <div className="relative br1 dark-gray w-40 center ba b--light-gray bg-white" style={{ pointerEvents: 'auto' }}>
        <div className="fileImportStatusButton pv2 ph3 relative flex items-center no-select pointer charcoal w-100 justify-between" style={{ background: '#F0F6FA' }}>
          <span>
            { filesPending.length
              ? `${t('filesImportStatus.importing', { count: filesPending.length })} (${progress}%)`
              : t('filesImportStatus.imported', { count: numberOfImportedFiles })
            }
          </span>
          <div className="flex items-center">
            <button className='fileImportStatusArrow' onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={ t('filesImportStatus.toggleDropdown') }>
              <GlyphSmallArrows className='w-100' fill="currentColor" opacity="0.7" aria-hidden="true"/>
            </button>
            <button className='fileImportStatusCancel' onClick={ handleImportStatusClose } aria-label={ t('filesImportStatus.closeDropdown') }>
              <GlyphSmallCancel className='w-100' fill="currentColor" opacity="0.7"/>
            </button>
          </div>
        </div>
        <ul className='fileImportStatusRow pa0 ma0' aria-hidden={!expanded}>
          { filesPending.map(file => File(file, t)) }
          { sortedFilesFinished.map(file => File(file, t)) }
          { filesErrors.map(file => File(file, t)) }
        </ul>
        {
          filesPending.length
            ? <ProgressBar progress={progress} bg="bg-teal" br="br0" className="absolute bottom-0" style={{ height: '4px' }} />
            : null
        }
      </div>
    </div>
  )
}

FileImportStatus.propTypes = {
  filesFinished: PropTypes.array,
  filesPending: PropTypes.array,
  filesErrors: PropTypes.array,
  doFilesClear: PropTypes.func,
  initialExpanded: PropTypes.bool
}

FileImportStatus.defaultProps = {
  filesFinished: [],
  filesPending: [],
  filesErrors: [],
  initialExpanded: true
}

export default connect(
  'selectFilesFinished',
  'selectFilesPending',
  'selectFilesErrors',
  'doFilesClear',
  withTranslation('files')(FileImportStatus)
)
