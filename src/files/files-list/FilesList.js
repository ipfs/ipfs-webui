import React, { useRef, Fragment, useState, useEffect, useMemo, useCallback } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { Trans, withTranslation } from 'react-i18next'
import classnames from 'classnames'
import { join } from 'path'
import { sorts } from '../../bundles/files/index.js'
import { normalizeFiles } from '../../lib/files.js'
import { List, WindowScroller, AutoSizer } from 'react-virtualized'
// React DnD
import { NativeTypes } from 'react-dnd-html5-backend'
import { useDrop } from 'react-dnd'
// Components
import Checkbox from '../../components/checkbox/Checkbox.js'
// import SelectedActions from '../selected-actions/SelectedActions.js'
import File from '../file/File.js'
import LoadingAnimation from '../../components/loading-animation/LoadingAnimation.js'
import SearchFilter from '../search-filter/SearchFilter'

const addFiles = async (filesPromise, onAddFiles) => {
  const files = await filesPromise
  onAddFiles(normalizeFiles(files))
}

const mergeRemotePinsIntoFiles = (files, remotePins = [], pendingPins = [], failedPins = []) => {
  const remotePinsCids = remotePins.map(id => id.split(':').at(-1))
  const pendingPinsCids = pendingPins.map(id => id.split(':').at(-1))
  const failedPinsCids = failedPins.map(id => id.split(':').at(-1))

  return files.map(f => {
    const fileFailedPins = failedPinsCids.reduce((acc, cid, i) => {
      if (cid === f.cid?.toString()) {
        acc.push(failedPins[i])
      }

      return acc
    }, [])

    const isRemotePin = remotePinsCids.includes(f.cid?.toString())
    const isPendingPin = pendingPinsCids.includes(f.cid?.toString())
    const isFailedPin = fileFailedPins.length > 0

    return {
      ...f,
      isRemotePin,
      isPendingPin,
      isFailedPin,
      failedPins: fileFailedPins
    }
  })
}

export const FilesList = ({
  className = '', files, pins, pinningServices, remotePins = [], pendingPins = [], failedPins = [], filesSorting, updateSorting, filesIsFetching, filesPathInfo, showLoadingAnimation,
  onShare, onSetPinning, selected, onSelect, onInspect, onDownload, onRemove, onRename, onNavigate, onRemotePinClick, onAddFiles, onMove, doFetchRemotePins, doDismissFailedPin, handleContextMenuClick, showSearch, filterRef, t
}) => {
  const [focused, setFocused] = useState(null)
  const [firstVisibleRow, setFirstVisibleRow] = useState(null)
  const [allFiles, setAllFiles] = useState(mergeRemotePinsIntoFiles(files, remotePins, pendingPins, failedPins))
  const [filter, setFilter] = useState(() => filterRef?.current || '')
  const listRef = useRef()
  const filesRefs = useRef([])
  const refreshPinCache = true

  filesPathInfo = filesPathInfo ?? {}
  const [{ canDrop, isOver, isDragging }, drop] = useDrop({
    accept: NativeTypes.FILE,
    drop: (_, monitor) => {
      if (monitor.didDrop()) {
        return
      }
      const { filesPromise } = monitor.getItem()
      addFiles(filesPromise, onAddFiles)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      isDragging: monitor.isDragging
    }),
    canDrop: _ => filesPathInfo.isMfs
  })

  const filteredFiles = useMemo(() => {
    if (!filter) return allFiles

    const filterLower = filter.toLowerCase()
    return allFiles.filter(file => {
      // Search by name
      if (file.name && file.name.toLowerCase().includes(filterLower)) {
        return true
      }
      // Search by CID
      if (file.cid && file.cid.toString().toLowerCase().includes(filterLower)) {
        return true
      }
      // Search by type
      if (file.type && file.type.toLowerCase().includes(filterLower)) {
        return true
      }
      return false
    })
  }, [allFiles, filter])

  const selectedFiles = useMemo(() =>
    selected
      .map(name => allFiles.find(el => el.name === name))
      .filter(n => n)
      .map(file => ({
        ...file,
        pinned: pins.map(p => p.toString()).includes(file.cid.toString())
      }))
  , [allFiles, pins, selected])

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
    if (filterRef) filterRef.current = newFilter
    setFocused(null)
  }, [filterRef])

  useEffect(() => {
    if (!showSearch) {
      setFilter('')
      if (filterRef) filterRef.current = ''
    }
  }, [showSearch, filterRef])

  const toggleOne = useCallback((name, check) => {
    onSelect(name, check)
  }, [onSelect])

  const keyHandler = useCallback((e) => {
    const focusedFile = filteredFiles.find(el => el.name === focused)

    // Disable keyboard controls if fetching files
    if (filesIsFetching) {
      return
    }

    if (e.key === 'Escape') {
      onSelect([], false)
      setFocused(null)
      return listRef.current?.forceUpdateGrid?.()
    }

    if (e.key === 'F2' && focused !== null) {
      return onRename([focusedFile])
    }

    if (e.key === 'Delete' && selected.length > 0) {
      return onRemove(selectedFiles)
    }

    if (e.key === ' ' && focused !== null) {
      e.preventDefault()
      return toggleOne(focused, true)
    }

    if ((e.key === 'Enter' || (e.key === 'ArrowRight' && e.metaKey)) && focused !== null) {
      return onNavigate({ path: focusedFile.path, cid: focusedFile.cid })
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      let index = 0

      if (focused !== null) {
        const prev = filteredFiles.findIndex(el => el.name === focused)
        index = (e.key === 'ArrowDown') ? prev + 1 : prev - 1
      }

      if (index === -1 || index >= filteredFiles.length) {
        return
      }

      let name = filteredFiles[index].name

      // If the file we are going to focus is out of view (removed
      // from the DOM by react-virtualized), focus the first visible file
      if (!filesRefs.current[name]) {
        name = filteredFiles[firstVisibleRow]?.name
      }

      setFocused(name)
    }
  }, [
    filteredFiles,
    focused,
    firstVisibleRow,
    filesIsFetching,
    onNavigate,
    onRemove,
    onRename,
    onSelect,
    selected.length,
    selectedFiles,
    toggleOne,
    listRef
  ])

  useEffect(() => {
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('keydown', keyHandler)
    }
  }, [keyHandler])

  useEffect(() => {
    setAllFiles(mergeRemotePinsIntoFiles(files, remotePins, pendingPins, failedPins))
  }, [files, remotePins, filesSorting, pendingPins, failedPins])

  const toggleAll = (checked) => {
    if (checked) {
      onSelect(filteredFiles.map(file => file.name), true)
    } else {
      onSelect([], false)
    }
  }

  const move = (src, dst) => {
    if (selectedFiles.length > 0) {
      const parts = dst.split('/')
      parts.pop()
      let basepath = parts.join('/')

      if (basepath === '') {
        basepath = '/'
      }

      const toMove = selectedFiles.map(({ name, path }) => ([
        path,
        join(basepath, name)
      ]))

      const res = toMove.find(a => a[0] === src)
      if (!res) {
        toMove.push([src, dst])
      }

      toggleAll(false)
      toMove.forEach(op => onMove(...op))
    } else {
      onMove(src, dst)
    }
  }

  const sortByIcon = (order) => {
    if (filesSorting.by === sorts.BY_ORIGINAL) {
      return null // No arrows when in original order
    }
    if (filesSorting.by === order) {
      return filesSorting.asc ? '↑' : '↓'
    }

    return null
  }

  const changeSort = (order) => () => {
    if (order === filesSorting.by) {
      // Same column clicked - cycle through states
      if (filesSorting.asc) {
        updateSorting(order, false) // asc → desc
      } else {
        updateSorting(sorts.BY_ORIGINAL, true) // desc → original
      }
    } else if (filesSorting.by === sorts.BY_ORIGINAL) {
      updateSorting(order, true) // original → asc for clicked column
    } else {
      updateSorting(order, true) // different column → asc
    }

    listRef.current?.forceUpdateGrid?.()
  }

  const emptyRowsRenderer = () => {
    if (filter) {
      return <div className='pv3 b--light-gray bt tc charcoal-muted f6'>{t('noFilesMatchFilter')}</div>
    }
    if (filesPathInfo.isRoot) {
      return null
    }
    return (
      <Trans i18nKey='filesList.noFiles' t={t}>
        <div className='pv3 b--light-gray bt tc gray f6'>No files in this directory. Click the &quot;Import&quot; button to add some.</div>
      </Trans>
    )
  }

  const rowRenderer = ({ index, key, style }) => {
    const pinsString = pins.map(p => p.toString())
    const listItem = filteredFiles[index]
    const onNavigateHandler = () => {
      if (listItem.type === 'unknown') return onInspect(listItem.cid)
      return onNavigate({ path: listItem.path, cid: listItem.cid })
    }
    const onDismissFailedPinHandler = () => {
      doDismissFailedPin(...listItem.failedPins)
    }

    return (
      <div key={key} style={style} ref={r => { filesRefs.current[filteredFiles[index].name] = r }}>
        <File
          {...listItem}
          pinned={pinsString.includes(listItem.cid.toString())}
          isMfs={filesPathInfo.isMfs}
          name={listItem.name}
          onSelect={toggleOne}
          onNavigate={onNavigateHandler}
          onAddFiles={onAddFiles}
          onSetPinning={onSetPinning}
          onDismissFailedPin={onDismissFailedPinHandler}
          onMove={move}
          focused={focused === listItem.name}
          selected={selected.indexOf(listItem.name) !== -1}
          handleContextMenuClick={handleContextMenuClick}
          translucent={isDragging || (isOver && canDrop)} />
      </div>
    )
  }

  const onRowsRendered = ({ startIndex }) => setFirstVisibleRow(startIndex)

  const allSelected = selected.length !== 0 && selected.length === filteredFiles.length
  const rowCount = filteredFiles.length
  const checkBoxCls = classnames({
    'o-1': allSelected,
    'o-70': !allSelected
  }, ['pl2 w2 glow'])

  // Add a separate useEffect to handle scrolling when focus changes
  const currentFilesRef = filesRefs.current[focused]
  useEffect(() => {
    if (focused) {
      const domNode = currentFilesRef && findDOMNode(currentFilesRef)
      if (domNode) {
        domNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const checkbox = domNode.querySelector('input[type="checkbox"]')
        if (checkbox) checkbox.focus()
      }

      listRef.current?.forceUpdateGrid?.()
    }
  }, [currentFilesRef, focused, listRef])

  return (
    <section ref={drop} className={classnames('FilesList no-select sans-serif border-box w-100 flex flex-column', className)} data-testid="files-list">
      { showLoadingAnimation
        ? <LoadingAnimation />
        : <Fragment>
          <header className='gray pv3 flex items-center flex-none' style={{ paddingRight: '1px', paddingLeft: '1px' }}>
            <div className={checkBoxCls}>
              <Checkbox checked={allSelected} onChange={toggleAll} aria-label={t('selectAllEntries')}/>
            </div>
            <div className='ph2 f6 flex-auto'>
              <button className='charcoal-muted' aria-label={ t('sortBy', { name: t('app:terms.name') })} onClick={changeSort(sorts.BY_NAME)}>
                {t('app:terms.name')} {sortByIcon(sorts.BY_NAME)}
              </button>
            </div>
            <div className='pl2 pr1 tr f6 flex-none dn db-l mw4'>
              <button
                className='charcoal-muted'
                aria-label={t('sortBy', { name: t('app:terms.pinStatus') })}
                onClick={() => {
                  changeSort(sorts.BY_PINNED)()
                  if (pinningServices && pinningServices.length) {
                    doFetchRemotePins(files, refreshPinCache)
                  }
                }}
              >
                {t('app:terms.pinStatus')} {sortByIcon(sorts.BY_PINNED)}
              </button>
            </div>
            <div className='pl2 pr4 tr f6 flex-none dn db-l mw4 w-10'>
              <button className='charcoal-muted' aria-label={ t('sortBy', { name: t('size') })} onClick={changeSort(sorts.BY_SIZE)}>
                {t('app:terms.size')} {sortByIcon(sorts.BY_SIZE)}
              </button>
            </div>
            <div className='pa2' style={{ width: '2.5rem' }} />
          </header>
          {showSearch && <SearchFilter
            initialValue={filter}
            onFilterChange={handleFilterChange}
            filteredCount={filteredFiles.length}
            totalCount={allFiles.length}
          />}
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <div className='flex-auto'>
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      ref={listRef}
                      autoHeight
                      width={width}
                      height={height}
                      className='outline-0'
                      aria-label={ t('filesListLabel')}
                      rowCount={rowCount}
                      rowHeight={55}
                      rowRenderer={rowRenderer}
                      noRowsRenderer={emptyRowsRenderer}
                      onRowsRendered={onRowsRendered}
                      isScrolling={isScrolling}
                      onScroll={onChildScroll}
                      scrollTop={scrollTop}/>
                  )}
                </AutoSizer>
              </div>
            )}
          </WindowScroller>
        </Fragment>}
    </section>
  )
}

FilesList.propTypes = {
  className: PropTypes.string,
  files: PropTypes.array.isRequired,
  remotePins: PropTypes.array,
  pendingPins: PropTypes.array,
  failedPins: PropTypes.array,
  filesSorting: PropTypes.shape({
    by: PropTypes.string.isRequired,
    asc: PropTypes.bool.isRequired
  }),
  updateSorting: PropTypes.func.isRequired,
  filesIsFetching: PropTypes.bool,
  filesPathInfo: PropTypes.object,
  // Actions
  onShare: PropTypes.func.isRequired,
  onSetPinning: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onAddFiles: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  handleContextMenuClick: PropTypes.func.isRequired,
  // From i18next
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool
}

export default connect(
  'selectPins',
  'selectPinningServices',
  'doFetchRemotePins',
  'selectFilesIsFetching',
  'selectFilesSorting',
  'selectFilesPathInfo',
  'selectShowLoadingAnimation',
  'doDismissFailedPin',
  withTranslation('files')(FilesList)
)
