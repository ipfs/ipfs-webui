import React, { useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { NativeTypes } from 'react-dnd-html5-backend'

import './Breadcrumbs.css'
import { useDrop } from 'react-dnd'
import { basename, join } from 'path'
import { normalizeFiles } from '../../lib/files'

const DropableBreadcrumb = ({ index, link, path, onAddFiles, onMove, onClick, onContextMenuHandle }) => {
  const [{ isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE, 'FILE'],
    drop: ({ files, filesPromise, path: filePath }) => {
      if (files) {
        (async () => {
          const files = await filesPromise
          onAddFiles(await normalizeFiles(files), path)
        })()
      } else {
        const src = filePath
        const dst = join(path, basename(filePath))

        onMove(src, dst)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  const buttonRef = useRef()

  const handleOnContextMenuHandle = (ev) => onContextMenuHandle(ev, buttonRef.current)

  return (
    <span className='dib pv1 pr1' ref={drop}>
      <button ref={buttonRef} title={link.realName}
        className={classNames('BreadcrumbsButton relative', index !== 0 && 'navy', index === 0 && 'f7 pointer pa1 bg-navy br2 mr2 white', link.last && 'b', isOver && 'dragging')}
        onClick={() => onClick(link.path)} onContextMenu={(ev) => index !== 0 && handleOnContextMenuHandle(ev)}>
        {link.name}
      </button>
    </span>
  )
}

const Breadcrumbs = ({ t, tReady, path, onClick, className, onContextMenuHandle, onAddFiles, onMove, ...props }) => {
  const [overflows, setOverflows] = useState(false)
  const anchors = useRef()

  useEffect(() => {
    const a = anchors.current

    const newOverflows = a ? (a.offsetHeight < a.scrollHeight || a.offsetWidth < a.scrollWidth) : false
    if (newOverflows !== overflows) {
      setOverflows(newOverflows)
    }
  }, [overflows])

  const bread = makeBread(path, t)

  return (
    <nav aria-label={t('breadcrumbs')} className={classNames('Breadcrumbs flex items-center sans-serif overflow-hidden', className)} {...props}>
      <div className='nowrap overflow-hidden relative flex flex-wrap' ref={ anchors }>
        <div className={`absolute left-0 top-0 h-100 w1 ${overflows ? '' : 'dn'}`} style={{ background: 'linear-gradient(to right, #ffffff 0%, transparent 100%)' }} />

        { bread.map((link, index) => (
          <div key={`${index}link`}>
            <DropableBreadcrumb index={index} link={link} path={path}
              onAddFiles={onAddFiles} onMove={onMove} onClick={onClick} onContextMenuHandle={onContextMenuHandle} />
            <span className='dib pr1 pv1 mid-gray v-top'>/</span>
          </div>
        )
        )}

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

function makeBread (root, t) {
  if (root.endsWith('/')) {
    root = root.substring(0, root.length - 1)
  }

  const parts = root.split('/').map(part => {
    return {
      name: part,
      path: part
    }
  })

  for (let i = 1; i < parts.length; i++) {
    const name = parts[i].name

    parts[i] = {
      name: name,
      path: parts[i - 1].path + '/' + parts[i].path
    }

    if (name.length >= 30) {
      parts[i].realName = name
      parts[i].name = `${name.substring(0, 4)}...${name.substring(name.length - 4, name.length)}`
    }
  }

  parts.shift()
  parts[0].name = t(parts[0].name)

  parts[parts.length - 1].last = true
  return parts
}

export default withTranslation('files')(Breadcrumbs)
