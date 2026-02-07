import React from 'react'
import typeFromExt from '../type-from-ext/index.js'

import Folder from '../../icons/GlyphFolder.js'
import Doc from '../../icons/GlyphDocGeneric.js'
import DocMovie from '../../icons/GlyphDocMovie.js'
import DocCalc from '../../icons/GlyphDocCalc.js'
import DocMusic from '../../icons/GlyphDocMusic.js'
import DocPicture from '../../icons/GlyphDocPicture.js'
import DocText from '../../icons/GlyphDocText.js'
import Cube from '../../icons/StrokeCube.js'

/**
 * @param {{ name: string, type: string, style?: React.CSSProperties, cls?: string }} props
 * @returns {React.ReactElement}
 */
export default function FileIcon ({ name, type, style = { width: 36 }, cls = '' }) {
  if (type === 'directory') {
    return <Folder className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
  }

  if (type === 'unknown') {
    return <Cube className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
  }

  switch (typeFromExt(name)) {
    case 'audio':
      return <DocMusic className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
    case 'calc':
      return <DocCalc className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
    case 'video':
      return <DocMovie className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
    case 'text':
      return <DocText className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
    case 'image':
      return <DocPicture className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
    default:
      return <Doc className={cls} style={{ ...style, fill: 'var(--theme-brand-aqua)' }} />
  }
}
