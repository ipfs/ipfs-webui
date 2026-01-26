import React, { useMemo, useState, useCallback } from 'react'
import { humanSize } from '../../lib/files.js'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
// Icons
import DocumentIcon from '../../icons/GlyphDocGeneric.tsx'
import FolderIcon from '../../icons/GlyphFolder.tsx'
import './FileImportStatus.css'
import GlyphSmallArrows from '../../icons/GlyphSmallArrow.tsx'
import GlyphTick from '../../icons/GlyphTick.tsx'
import GlyphCancel from '../../icons/GlyphCancel.tsx'
import GlyphSmallCancel from '../../icons/GlyphSmallCancel.tsx'
import ProgressBar from '../../components/progress-bar/ProgressBar.js'
import { ACTIONS } from '../../bundles/files/consts.js'

const Import = (job, t) =>
  [...groupByPath(job?.message?.entries || new Map()).values()].map(item => (
    <li className="flex w-100 bb b--light-gray items-center f6 charcoal" key={item.path}>
      {viewIcon(item)}
      <span className="fileImportStatusName truncate">{item.path}</span>
      <span className='gray mh2'> |
        { item.entries && (<span> { t('filesImportStatus.count', { count: item.entries.length }) } | </span>) }
        <span className='ml2'>{ humanSize(item.size) }</span>
      </span>
      {viewImportStatus(job, item.progress)}
    </li>
  ))

/**
 * Renders a failed import job with its error message.
 * Used for jobs like ADD_BY_PATH that don't have message.entries structure.
 */
const FailedImport = (job, t) => {
  const path = job.init || t('filesImportStatus.unknownPath', 'Unknown path')
  const errorMessage = job.error?.message || t('filesImportStatus.unknownError', 'Unknown error')

  return (
    <li className="flex flex-column w-100 bb b--light-gray f6 charcoal" key={job.id?.toString() || path}>
      <div className="flex items-center">
        <DocumentIcon className="fileImportStatusIcon fileImportStatusIconError pa1" />
        <span className="fileImportStatusName truncate">{path}</span>
        <GlyphCancel className="dark-red w2 ph1 ml-auto" fill="currentColor"/>
      </div>
      <div className="f7 dark-red mt1 truncate" style={{ marginLeft: '36px' }} title={errorMessage}>
        {errorMessage}
      </div>
    </li>
  )
}

const viewIcon = (entry) =>
  entry.type === 'directory'
    ? <FolderIcon className="fileImportStatusIcon fill-aqua pa1" />
    : <DocumentIcon className="fileImportStatusIcon fill-aqua pa1" />

const viewImportStatus = (job, progress) => {
  switch (job.status) {
    case 'Pending': {
      return <LoadingIndicator complete={ progress === 100 } />
    }
    case 'Failed': {
      return (<GlyphCancel className="dark-red w2 ph1" fill="currentColor"/>)
    }
    default: {
      return (<LoadingIndicator complete={true}/>)
    }
  }
}

const groupByPath = (entries) => {
  const groupedEntries = new Map()
  for (const entry of entries) {
    const name = baseDirectoryOf(entry)
    if (name == null) {
      groupedEntries.set(entry.path, { type: 'file', ...entry })
    } else {
      // add `/` to avoid collision with file names.
      const directory = groupedEntries.get(`${name}/`)
      if (directory) {
        directory.entries.push(entry)
        directory.size += entry.size
      } else {
        groupedEntries.set(`${name}/`, {
          type: 'directory',
          size: entry.size,
          path: name,
          entries: [entry]
        })
      }
    }
  }
  return groupedEntries
}

/**
 * @typedef {Object} Entry
 * @property {string} path
 * @property {size} number
 */

/**
 * @param {Entry} entry
 * @returns {string|null}
 */
const baseDirectoryOf = ({ path }) => {
  const index = path.indexOf('/')
  return index < 0 ? null : path.slice(0, index)
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

  const handleExpandByKeyboard = (ev) => {
    const isTargetElementBeingClicked = ev.nativeEvent.target.tagName === 'BUTTON'
    if (ev.nativeEvent?.code !== 'Space' || isTargetElementBeingClicked) return

    setExpanded(!expanded)
  }

  // Separate WRITE errors (have message.entries) from ADD_BY_PATH errors (no message.entries)
  const writeErrors = filesErrors.filter(e => e.type === ACTIONS.WRITE)
  const importPathErrors = filesErrors.filter(e => e.type === ACTIONS.ADD_BY_PATH)

  const numberOfImportedItems = !filesFinished.length ? 0 : filesFinished.reduce((prev, finishedFile) => prev + (finishedFile.message?.entries?.length ?? 1), 0)
  const numberOfFailedItems = writeErrors.reduce((prev, failedFile) => prev + (failedFile.message?.entries?.length ?? 1), 0) + importPathErrors.length
  const numberOfPendingItems = filesPending.reduce((total, pending) => total + groupByPath(pending.message?.entries || []).size, 0)
  const progress = Math.floor(filesPending.reduce((total, { message: { progress } }) => total + progress, 0) / filesPending.length)

  // Find the most recent operation by comparing timestamps
  const lastFinished = filesFinished.length > 0
    ? Math.max(...filesFinished.map(f => f.start))
    : 0
  const lastFailed = filesErrors.length > 0
    ? Math.max(...filesErrors.map(f => f.start))
    : 0

  // Show error styling only if the most recent operation was a failure
  const hasErrors = lastFailed > lastFinished && !filesPending.length
  const containerClass = hasErrors ? 'fileImportStatusError' : ''

  return (
    <div className='fileImportStatus fixed bottom-1 w-100 flex justify-center' style={{ zIndex: 14, pointerEvents: 'none' }}>
      <div className={`relative br1 dark-gray w-40 center ba b--light-gray bg-white ${containerClass}`} style={{ pointerEvents: 'auto' }}>
        <div
          tabIndex="0"
          onClick={() => setExpanded(!expanded)}
          onKeyPress={handleExpandByKeyboard}
          role="button"
          className="fileImportStatusButton pv2 ph3 relative flex items-center no-select pointer charcoal w-100 justify-between"
          aria-expanded={expanded}
          style={{ background: '#F0F6FA' }}
        >
          <span>
            { filesPending.length
              ? `${t('filesImportStatus.importing', { count: numberOfPendingItems })} (${progress}%)`
              : hasErrors
                ? t('filesImportStatus.failed', { count: numberOfFailedItems })
                : t('filesImportStatus.imported', { count: numberOfImportedItems })
            }
          </span>
          <div className="flex items-center">
            <button className='fileImportStatusArrow ph0 flex' onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={ t('filesImportStatus.toggleDropdown') }>
              <GlyphSmallArrows viewBox="10 10 80 80" fill="currentColor" opacity="0.7" aria-hidden="true"/>
            </button>
            <button className='fileImportStatusCancel ph0 flex' onClick={handleImportStatusClose} aria-label={ t('filesImportStatus.closeDropdown') }>
              <GlyphSmallCancel fill="currentColor" opacity="0.7"/>
            </button>
          </div>
        </div>
        <ul className='fileImportStatusRow pa0 ma0' aria-hidden={!expanded}>
          { filesPending.map(file => Import(file, t)) }
          { hasErrors && (
            <>
              { writeErrors.map(file => Import(file, t)) }
              { importPathErrors.map(file => FailedImport(file, t)) }
            </>
          )}
          { sortedFilesFinished.map(file => Import(file, t)) }
          { !hasErrors && (
            <>
              { writeErrors.map(file => Import(file, t)) }
              { importPathErrors.map(file => FailedImport(file, t)) }
            </>
          )}
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
