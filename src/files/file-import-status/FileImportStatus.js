import React, { useMemo, useState, useCallback } from 'react'
import { humanSize } from '../../lib/files'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import './FileImportStatus.css'
import ProgressBar from '../../components/progress-bar/ProgressBar'

import RetroContainer from '../../components/common/atoms/RetroContainer'
import CloseMark from '../../icons/retro/CloseMark'
import RetroButton from '../../components/common/atoms/RetroButton'
import SuccessIcon from '../../icons/retro/SuccessIcon'
// import CancelIcon from '../../icons/retro/CancelIcon'
import DownArrowIcon from '../../icons/retro/files/DownArrowIcon'
import CloseSquareIcon from '../../icons/retro/files/CloseSquareIcon'
import CheckmarkIcon from '../../icons/retro/files/CheckmarkIcon'

const Import = (job, t) =>
  [...groupByPath(job?.message?.entries || new Map()).values()].map(item => (
    <li className="flex w-100 bb items-center f6 charcoal" style={{ padding: '10px 8px' }} key={item.path}>
      <span className="fileImportStatusName truncate ml2 fs12 w95fa spacegrotesk  white">{item.path}</span>
      <span className='mh2 w95fa  white spacegrotesk fs12'>
        {item.entries && (<span className='spacegrotesk fs12'> {t('filesImportStatus.count', { count: item.entries.length })} | </span>)}
        <span className='ml2 w95fa spacegrotesk fs12' style={{ textTransform: 'lowercase' }}>{humanSize(item.size)}</span>
      </span>
      {viewImportStatus(job, item.progress)}
    </li>
  ))

const viewImportStatus = (job, progress) => {
  switch (job.status) {
    case 'Pending': {
      return <LoadingIndicator complete={progress === 100} />
    }
    case 'Failed': {
      return <CloseSquareIcon/>
      // return (<CancelIcon style={{ width: '32px', height: '16px' }} className="w2 ph1 pv2" />)
    }
    default: {
      return (<CheckmarkIcon />)
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
  complete ? <SuccessIcon style={{ width: '32px', height: '16px' }} className="w2 ph1 pv2" /> : <span className="w2 ph1" style={{ paddingTop: '32px' }} />

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

  const numberOfImportedItems = !filesFinished.length ? 0 : filesFinished.reduce((prev, finishedFile) => prev + finishedFile.message.entries.length, 0)
  const numberOfPendingItems = filesPending.reduce((total, pending) => total + groupByPath(pending.message.entries).size, 0)
  const progress = Math.floor(filesPending.reduce((total, { message: { progress } }) => total + progress, 0) / filesPending.length)

  return (
    <div className='fileImportStatus fixed bottom-1 w-100 flex justify-center' style={{ zIndex: 14, pointerEvents: 'none' }}>
      <RetroContainer width='40%' border={'1px solid gray'} bgColor='#312F62' padding={-3} className="relative br1 dark-gray w-40 center ba" style={{ pointerEvents: 'auto', paddingTop: '0px' }}>
        <div className="fileImportStatusButton relative flex items-center no-select charcoal w-100 justify-between">
          <span className='w95fa white fs12 spacegrotesk'>
            {filesPending.length
              ? `${t('filesImportStatus.importing', { count: numberOfPendingItems })} (${progress}%)`
              : t('filesImportStatus.imported', { count: numberOfImportedItems })
            }
          </span>
          <div className="flex items-center">
            <RetroButton
              minWidth='22px'
              minHeight='22px'
              activeBgColor='transparent'
              focusBgColor='transparent'
              flat
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={t('filesImportStatus.toggleDropdown')}>
              <DownArrowIcon color='white' style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)', padding: '1px' }} />
            </RetroButton>
            <RetroButton
              activeBgColor='transparent'
              focusBgColor='transparent'
              minWidth='22px'
              minHeight='22px'
              flat
              onClick={handleImportStatusClose}
              aria-label={t('filesImportStatus.closeDropdown')}>
              <CloseMark color={'white'} style={{ margin: '1px' }} />
            </RetroButton>
          </div>
        </div>
        <RetroContainer colors={['#464646', '#ECECEC']} inset style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <ul className='fileImportStatusRow pa0 ma0' aria-hidden={!expanded}>
            {filesPending.map(file => Import(file, t))}
            {sortedFilesFinished.map(file => Import(file, t))}
            {filesErrors.map(file => Import(file, t))}
          </ul>
          {
            filesPending.length
              ? <ProgressBar progress={progress} bg="bg-teal" br="br0" className="absolute bottom-0" style={{ height: '4px' }} />
              : null
          }
        </RetroContainer>
      </RetroContainer>
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
