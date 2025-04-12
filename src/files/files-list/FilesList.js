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
import { useShortcuts } from '../../contexts/ShortcutsContext.js'

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
  onShare, onSetPinning, selected, onSelect, onInspect, onDownload, onRemove, onRename, onNavigate, onRemotePinClick, onAddFiles, onMove, doFetchRemotePins, doDismissFailedPin, handleContextMenuClick, t
}) => {
  const focused = useRef(null)
  const [firstVisibleRow, setFirstVisibleRow] = useState(null)
  const [allFiles, setAllFiles] = useState(mergeRemotePinsIntoFiles(files, remotePins, pendingPins, failedPins))
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

  const selectedFiles = useMemo(() =>
    selected
      .map(name => allFiles.find(el => el.name === name))
      .filter(n => n)
      .map(file => ({
        ...file,
        pinned: pins.map(p => p.toString()).includes(file.cid.toString())
      }))
  , [allFiles, pins, selected])

  const toggleOne = useCallback((name, check) => {
    onSelect(name, check)
  }, [onSelect])

  const keyHandler = useCallback((e) => {
    const focusedFile = files.find(el => el.name === focused.current)

    // Disable keyboard controls if fetching files
    if (filesIsFetching) {
      return
    }

    if (e.key === 'Escape') {
      onSelect([], false)
      focused.current = null
      listRef.current?.forceUpdateGrid?.()
      return
    }

    if (e.key === 'F2' && focused.current !== null) {
      onRename([focusedFile])
      return
    }

    if (e.key === 'Delete' && selected.length > 0) {
      onRemove(selectedFiles)
      return
    }

    if (e.key === ' ' && focused.current !== null) {
      toggleOne(focused.current, true)
      return
    }

    if ((e.key === 'Enter' || (e.key === 'ArrowRight' && e.metaKey)) && focused.current !== null) {
      onNavigate({ path: focusedFile.path, cid: focusedFile.cid })
      return
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      let index = 0

      if (focused.current !== null) {
        const prev = files.findIndex(el => el.name === focused.current)
        index = (e.key === 'ArrowDown') ? prev + 1 : prev - 1
      }

      if (index === -1) {
        index = files.length - 1
      }

      if (index >= files.length) {
        index = 0
      }

      let name = files[index]?.name || null

      // If the file we are going to focus is out of view (removed
      // from the DOM by react-virtualized), focus the first visible file
      if (!filesRefs.current[name]) {
        name = files[firstVisibleRow]?.name || null
      }

      focused.current = name
      listRef.current?.forceUpdateGrid?.()

      if (listRef.current && name !== null) {
        const newIndex = files.findIndex(f => f.name === name)
        if (newIndex !== -1) {
          filesRefs.current[name].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      }
    }
  }, [
    files,
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

  useShortcuts([{
    keys: ['ArrowUp'],
    label: t('shortcutModal.moveUp'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'ArrowUp' })
    }
  }, {
    keys: ['ArrowDown'],
    label: t('shortcutModal.moveDown'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'ArrowDown' })
    }
  }, {
    keys: ['F2'],
    label: t('shortcutModal.rename'),
    group: t('shortcutModal.actions'),
    action: () => {
      keyHandler({ key: 'F2' })
    }
  }, {
    keys: ['Delete'],
    label: t('shortcutModal.delete'),
    group: t('shortcutModal.actions'),
    action: () => {
      keyHandler({ key: 'Delete' })
    }
  },
  {
    keys: ['Backspace'],
    hidden: true,
    label: t('shortcutModal.delete'),
    group: t('shortcutModal.actions'),
    action: () => {
      keyHandler({ key: 'Backspace' })
    }
  },
  {
    keys: ['Space'],
    label: t('shortcutModal.toggleSelection'),
    group: t('shortcutModal.selection'),
    action: () => {
      keyHandler({ key: ' ' })
    }
  }, {
    keys: ['Escape'],
    label: t('shortcutModal.deselectAll'),
    group: t('shortcutModal.selection'),
    action: () => {
      keyHandler({ key: 'Escape' })
    }
  }, {
    keys: ['Enter'],
    label: t('shortcutModal.navigate'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'Enter' })
    }
  },
  {
    keys: ['NumpadEnter'],
    hidden: true,
    label: t('shortcutModal.navigate'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'NumpadEnter' })
    }
  }])

  useEffect(() => {
    setAllFiles(mergeRemotePinsIntoFiles(files, remotePins, pendingPins, failedPins))
  }, [files, remotePins, filesSorting, pendingPins, failedPins])

  const toggleAll = (checked) => {
    if (checked) {
      onSelect(allFiles.map(file => file.name), true)
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
    if (filesSorting.by === order) {
      return filesSorting.asc ? '↑' : '↓'
    }

    return null
  }

  const changeSort = (order) => () => {
    if (order === filesSorting.by) {
      updateSorting(order, !filesSorting.asc)
    } else {
      updateSorting(order, true)
    }

    listRef.current?.forceUpdateGrid?.()
  }

  const emptyRowsRenderer = () => (
    <Trans i18nKey='filesList.noFiles' t={t}>
      <div className='pv3 b--light-gray bt tc gray f6'>
            There are no available files. Add some!
      </div>
    </Trans>
  )

  const rowRenderer = ({ index, key, style }) => {
    const pinsString = pins.map(p => p.toString())
    const listItem = allFiles[index]
    const onNavigateHandler = () => {
      if (listItem.type === 'unknown') return onInspect(listItem.cid)
      return onNavigate({ path: listItem.path, cid: listItem.cid })
    }
    const onDismissFailedPinHandler = () => {
      doDismissFailedPin(...listItem.failedPins)
    }

    return (
      <div key={key} style={style} ref={r => { filesRefs.current[allFiles[index].name] = r }}>
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
          focused={focused.current === listItem.name}
          selected={selected.indexOf(listItem.name) !== -1}
          handleContextMenuClick={handleContextMenuClick}
          translucent={isDragging || (isOver && canDrop)} />
      </div>
    )
  }

  const onRowsRendered = ({ startIndex }) => setFirstVisibleRow(startIndex)

  const allSelected = selected.length !== 0 && selected.length === allFiles.length
  const rowCount = allFiles.length
  const checkBoxCls = classnames({
    'o-1': allSelected,
    'o-70': !allSelected
  }, ['pl2 w2 glow'])

  // Add a separate useEffect to handle scrolling when focus changes
  const currentFilesRef = filesRefs.current[focused.current]
  useEffect(() => {
    if (focused.current && currentFilesRef) {
      const domNode = currentFilesRef && findDOMNode(currentFilesRef)
      if (domNode) {
        domNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        const checkbox = domNode.querySelector('input[type="checkbox"]')
        if (checkbox) checkbox.focus()
      }
    }
  }, [currentFilesRef])

  return (
    <section ref={drop} className={classnames('FilesList no-select sans-serif border-box w-100 flex flex-column', className)}>
      { showLoadingAnimation
        ? <LoadingAnimation />
        : <Fragment>
          <header className='gray pv3 flex items-center flex-none' style={{ paddingRight: '1px', paddingLeft: '1px' }}>
            <div className={checkBoxCls}>
              <Checkbox checked={allSelected} onChange={toggleAll} aria-label={t('selectAllEntries')}/>
            </div>
            <div className='ph2 f6 flex-auto'>
              <button aria-label={ t('sortBy', { name: t('app:terms.name') })} onClick={changeSort(sorts.BY_NAME)}>
                {t('app:terms.name')} {sortByIcon(sorts.BY_NAME)}
              </button>
            </div>
            <div className='pl2 pr1 tr f6 flex-none dn db-l mw4'>
              { pinningServices && pinningServices.length
                ? <button aria-label={t('app:terms.pinStatus')} onClick={() => doFetchRemotePins(files, refreshPinCache)}>{t('app:terms.pinStatus')}</button>
                : <>{t('app:terms.pinStatus')}</>
              }
            </div>
            <div className='pl2 pr4 tr f6 flex-none dn db-l mw4 w-10'>
              <button aria-label={ t('sortBy', { name: t('size') })} onClick={changeSort(sorts.BY_SIZE)}>
                {t('app:terms.size')} {sortByIcon(sorts.BY_SIZE)}
              </button>
            </div>
            <div className='pa2' style={{ width: '2.5rem' }} />
          </header>
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
                      scrollTop={scrollTop}
                    />
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
