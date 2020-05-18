import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import filesize from 'filesize'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
// Icons
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import './FileImportStatus.css'
import GlyphSmallArrows from '../../icons/GlyphSmallArrow'
import GlyphTick from '../../icons/GlyphTick'
import GlyphCancel from '../../icons/GlyphCancel'

const File = ({ paths = [], hasError }, t) => {
  console.log(paths)
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
    <li className="flex w-100 bb b--gray items-center" key={ path || name }>
      { count ? <FolderIcon className='fileImportStatusIcon'/> : <DocumentIcon className='fileImportStatusIcon'/> }
      <span className="fileImportStatusName truncate">{ name || path }</span>
      { progress && progress}
      <span className='gray mh2'> |
        { count && (<span> { t('filesImportStatus.count', { count }) } | </span>) }
        <span className='ml2'>{ filesize(size) }</span>
      </span>
      { hasError ? <GlyphCancel className="dark-red w2" fill="currentColor"/> : <LoadingIndicator complete={ !progress }/> }
    </li>
  ))
}

const LoadingIndicator = ({ complete }) => (
  <>
    <div className={ classNames('fileLoadingIndicator bg-light-gray mh4 flex-auto relative', complete && 'dn') }>
      <div className='fileLoadingIndicatorBar bg-blue absolute left-0'></div>
    </div>
    { complete && <GlyphTick className="green w2" fill="currentColor"/>}
  </>
)

const FileImportStatus = ({ filesFinished, filesPending, filesErrors, t }) => {
  const sortedFilesFinished = useMemo(() => filesFinished.sort((fileA, fileB) => fileB.start - fileA.start), [filesFinished])
  const [expanded, setExpanded] = useState(true)

  if (!filesFinished.length && !filesPending.length && !filesErrors.length) {
    return null
  }

  console.log(filesErrors)

  return (
    <div className='fileImportStatus fixed bottom-1 w-100 flex justify-center'>
      <div className="br1 dark-graymv4 w-40 center ba b--black bg-white">
        <div className="fileImportStatusButton pv2 ph3 relative flex items-center bg-light-gray no-select pointer"
          onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={ t('filesImportStatus.toggleDropdown') } role="button">
          { filesPending.length
            ? t('filesImportStatus.importing', { count: filesPending.length })
            : t('filesImportStatus.imported', { count: filesFinished.length })
          }
          <GlyphSmallArrows className='fileImportStatusArrow'/>
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
  filesPending: PropTypes.array
}

FileImportStatus.defaultProps = {
  filesFinished: [],
  filesPending: []
}

export default connect(
  'selectFilesFinished',
  'selectFilesPending',
  'selectFilesErrors',
  withTranslation('files')(FileImportStatus)
)
