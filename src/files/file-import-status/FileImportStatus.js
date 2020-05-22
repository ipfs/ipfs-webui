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

const File = ({ paths = [], hasError }, t) => {
  const pathsByFolder = paths.reduce((prev, currentPath) => {
    const isFolder = currentPath.path.includes('/')
    if (!isFolder) {
      return [...prev, currentPath]
    }

    const baseFolder = currentPath.path.split('/')[0]

    const alreadyExistentBaseFolder = prev.find(previousPath => previousPath.path.startsWith(`${baseFolder}/`))

    if (alreadyExistentBaseFolder) {
      alreadyExistentBaseFolder.count = alreadyExistentBaseFolder.count + 1

      return prev
    }

    return [...prev, { ...currentPath, name: baseFolder, count: 1 }]
  }, [])

  return pathsByFolder.map(({ count, name, path, size, progress }) => (
    <li className="flex w-100 bb b--light-gray items-center f6 charcoal" key={ path || name }>
      { count ? <FolderIcon className='fileImportStatusIcon fill-aqua pa1'/> : <DocumentIcon className='fileImportStatusIcon fill-aqua pa1'/> }
      <span className="fileImportStatusName truncate">{ name || path }</span>
      <span className='gray mh2'> |
        { count && (<span> { t('filesImportStatus.count', { count }) } | </span>) }
        <span className='ml2'>{ filesize(size) }</span>
      </span>
      { hasError ? <GlyphCancel className="dark-red w2 ph1" fill="currentColor"/> : <LoadingIndicator complete={ !progress }/> }
    </li>
  ))
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

  const numberOfImportedFiles = !filesFinished.length ? 0 : filesFinished.reduce((prev, finishedFile) => prev + finishedFile?.data?.paths?.length, 0)

  return (
    <div className='fileImportStatus fixed bottom-1 w-100 flex justify-center' style={{ zIndex: 14, pointerEvents: 'none' }}>
      <div className="br1 dark-gray w-40 center ba b--light-gray bg-white" style={{ pointerEvents: 'auto' }}>
        <div className="fileImportStatusButton pv2 ph3 relative flex items-center no-select pointer charcoal" style={{ background: '#F0F6FA' }}
          onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={ t('filesImportStatus.toggleDropdown') } role="button">
          { filesPending.length
            ? t('filesImportStatus.importing', { count: filesPending.length })
            : t('filesImportStatus.imported', { count: numberOfImportedFiles })
          }
          <GlyphSmallArrows className='fileImportStatusArrow' fill="currentColor" opacity="0.7"/>
          <div onClick={ handleImportStatusClose } aria-label={ t('filesImportStatus.closeDropdown') } role="button">
            <GlyphSmallCancel className='fileImportStatusCancel' fill="currentColor" opacity="0.7"/>
          </div>
        </div>
        <ul className='fileImportStatusRow pa0 ma0' aria-hidden={!expanded}>
          { filesPending.map(file => File(file.data, t)) }
          { sortedFilesFinished.map(file => File(file.data, t)) }
          { filesErrors.map(file => File(file.data, t)) }
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
