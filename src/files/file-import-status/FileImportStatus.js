import React, { useMemo, useState, useCallback } from 'react'
import classNames from 'classnames'
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

const Import = (job, t) =>
  [...groupByPath(job.message.entries).values()].map(item => (
    <li className="flex w-100 bb b--light-gray items-center f6 charcoal" key={item.path}>
      {viewIcon(item)}
      <span className="fileImportStatusName truncate">{item.path}</span>
      <span className='gray mh2'> |
        { item.entries && (<span> { t('filesImportStatus.count', { count: item.entries.length }) } | </span>) }
        <span className='ml2'>{ filesize(item.size) }</span>
      </span>
      {viewImportStatus(job)}
    </li>
  ))

const viewIcon = (entry) => entry.type === 'directory'
  ? <FolderIcon className='fileImportStatusIcon fill-aqua pa1'/>
  : <DocumentIcon className='fileImportStatusIcon fill-aqua pa1'/>

const viewImportStatus = (job) => {
  switch (job.status) {
    case 'Pending': {
      return (<LoadingIndicator />)
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

const LoadingIndicator = ({ complete }) => (
  <>
    <div className={ classNames('fileLoadingIndicator bg-light-gray mh4 flex-auto relative', complete && 'dn') }>
      <div className='fileLoadingIndicatorBar bg-blue absolute left-0'></div>
    </div>
    { complete && <GlyphTick className="green w2 ph1" fill="currentColor"/>}
  </>
)

const FileImportStatus = ({ filesFinished, filesPending, filesErrors, doFilesClear, t }) => {
  const sortedFilesFinished = useMemo(() => filesFinished.sort((fileA, fileB) => fileB.start - fileA.start), [filesFinished])
  const [expanded, setExpanded] = useState(true)

  const handleImportStatusClose = useCallback((ev) => {
    doFilesClear()
    ev.stopPropagation() // Prevent setExpanded from being called
  }, [doFilesClear])

  if (!filesFinished.length && !filesPending.length && !filesErrors.length) {
    return null
  }

  const numberOfPendingItems = filesPending.reduce((total, pending) => total + groupByPath(pending.message.entries).size, 0)
  const numberOfImportedItems = filesFinished.reduce((total, finished) => total + groupByPath(finished.value).size, 0)

  return (
    <div className='fileImportStatus fixed bottom-1 w-100 flex justify-center' style={{ zIndex: 14, pointerEvents: 'none' }}>
      <div className="br1 dark-gray w-40 center ba b--light-gray bg-white" style={{ pointerEvents: 'auto' }}>
        <div className="fileImportStatusButton pv2 ph3 relative flex items-center no-select pointer charcoal w-100 justify-between" style={{ background: '#F0F6FA' }}>
          <span>
            { filesPending.length
              ? t('filesImportStatus.importing', { count: numberOfPendingItems })
              : t('filesImportStatus.imported', { count: numberOfImportedItems })
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
          { filesPending.map(file => Import(file, t)) }
          { sortedFilesFinished.map(file => Import(file, t)) }
          { filesErrors.map(file => Import(file, t)) }
        </ul>
      </div>
    </div>
  )
}

FileImportStatus.propTypes = {
  filesFinished: PropTypes.array,
  filesPending: PropTypes.array,
  filesErrors: PropTypes.array,
  doFilesClear: PropTypes.func
}

FileImportStatus.defaultProps = {
  filesFinished: [],
  filesPending: [],
  filesErrors: []
}

export default connect(
  'selectFilesFinished',
  'selectFilesPending',
  'selectFilesErrors',
  'doFilesClear',
  withTranslation('files')(FileImportStatus)
)
