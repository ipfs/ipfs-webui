import React, { useEffect, useState, useRef, useMemo } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { basename, join } from 'path'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import { normalizeFiles } from '../../lib/files.js'

import './Breadcrumbs.css'

const DropableBreadcrumb = ({ index, link, immutable, onAddFiles, onMove, onClick, onContextMenuHandle, getPathInfo, checkIfPinned }) => {
  const [{ isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE, 'FILE'],
    drop: async ({ files, filesPromise, path: filePath }) => {
      if (files) {
        (async () => {
          const files = await filesPromise
          onAddFiles(await normalizeFiles(files), link.path)
        })()
      } else {
        const src = filePath
        const dst = join(link.path, basename(filePath))

        try { await onMove(src, dst) } catch (e) { console.error(e) }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  const buttonRef = useRef()

  const handleOnContextMenuHandle = async (ev) => {
    ev.preventDefault()

    const { path } = link
    const sanitizedPath = path.substring(path.indexOf('/', 1), path.length)
    const { cid, type } = await getPathInfo(sanitizedPath)
    const pinned = await checkIfPinned(cid)

    onContextMenuHandle(undefined, buttonRef.current, {
      ...link,
      type,
      cid,
      pinned
    })
  }

  return (
    <span className='dib pv1 pr1' ref={drop}>
      <button ref={buttonRef} title={link.realName}
        className={classNames('BreadcrumbsButton relative',
          index !== 0 && 'navy',
          index === 0 && 'f7 pa1 br2 mr2',
          index === 0 && (immutable ? 'bg-charcoal-muted white' : 'bg-navy white'),
          immutable && (link.last || index === 0) && 'no-events',
          link.last && 'b', isOver && 'dragging')}
        onClick={() => onClick({ path: link.path })} onContextMenu={(ev) => index !== 0 && handleOnContextMenuHandle(ev)}>
        {link.name}
      </button>
    </span>
  )
}

const Breadcrumbs = ({ t, tReady, path, onClick, className, onContextMenuHandle, onAddFiles, onMove, doGetPathInfo, doCheckIfPinned, ...props }) => {
  const [overflows, setOverflows] = useState(false)
  const [isImmutable, setImmutable] = useState(false)
  const anchors = useRef()

  useEffect(() => {
    const a = anchors.current

    const newOverflows = a ? (a.offsetHeight < a.scrollHeight || a.offsetWidth < a.scrollWidth) : false
    if (newOverflows !== overflows) {
      setOverflows(newOverflows)
    }
  }, [overflows])

  const bread = useMemo(() =>
    makeBread(path, t, isImmutable, setImmutable)
  , [isImmutable, path, t])

  return (
    <nav aria-label={t('breadcrumbs')} className={classNames('Breadcrumbs flex items-center sans-serif overflow-hidden sticky top-0', className)} {...props}>
      <div className='nowrap overflow-hidden relative flex flex-wrap' ref={ anchors }>
        <div className={`absolute left-0 top-0 h-100 w1 ${overflows ? '' : 'dn'}`} style={{ background: 'linear-gradient(to right, #ffffff 0%, transparent 100%)' }} />

        { bread.map((link, index) => (
          <div key={`${index}link`}>
            <DropableBreadcrumb index={index} link={link} immutable={isImmutable}
              onAddFiles={onAddFiles} onMove={onMove} onClick={onClick} onContextMenuHandle={onContextMenuHandle} getPathInfo={doGetPathInfo} checkIfPinned={doCheckIfPinned} />
            { index !== bread.length - 1 && <span className='dib pr1 pv1 mid-gray v-top'>/</span>}
          </div>
        ))}

      </div>
    </nav>
  )
}

Breadcrumbs.propTypes = {
  path: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  onContextMenuHandle: PropTypes.func
}

function makeBread (root, t, isImmutable, setImmutable) {
  if (root.endsWith('/')) {
    root = root.substring(0, root.length - 1)
  }

  const parts = root.split('/').map(part => ({
    name: part,
    path: part
  }))

  for (let i = 1; i < parts.length; i++) {
    const name = parts[i].name

    parts[i] = {
      name,
      path: parts[i - 1].path + '/' + parts[i].path
    }

    if (name.length >= 30) {
      parts[i].realName = name
      parts[i].name = `${name.substring(0, 4)}...${name.substring(name.length - 4, name.length)}`
    }
  }

  parts.shift()

  if (parts[0].name === 'ipfs' || parts[0].name === 'ipns') {
    !isImmutable && setImmutable(true)
  }

  parts[0].name = t(parts[0].name)

  parts[parts.length - 1].last = true
  return parts
}

export default connect(
  'doGetPathInfo',
  'doCheckIfPinned',
  withTranslation('files')(Breadcrumbs)
)
