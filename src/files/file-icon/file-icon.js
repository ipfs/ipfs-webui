import React from 'react'
import typeFromExt from '../type-from-ext/index.js'

import Folder from '../../icons/glyph-folder.js'
import Doc from '../../icons/glyph-doc-generic.js'
import DocMovie from '../../icons/glyph-doc-movie.js'
import DocCalc from '../../icons/glyph-doc-calc.js'
import DocMusic from '../../icons/glyph-doc-music.js'
import DocPicture from '../../icons/glyph-doc-picture.js'
import DocText from '../../icons/glyph-doc-text.js'
import Cube from '../../icons/stroke-cube.js'

const style = { width: 36 }

export default function FileIcon ({ name, type, cls = '' }) {
  if (type === 'directory') {
    return <Folder className={`fill-aqua ${cls}`} style={style} />
  }

  if (type === 'unknown') {
    return <Cube className={`fill-aqua ${cls}`} style={style} />
  }

  switch (typeFromExt(name)) {
    case 'audio':
      return <DocMusic className={`fill-aqua ${cls}`} style={style} />
    case 'calc':
      return <DocCalc className={`fill-aqua ${cls}`} style={style} />
    case 'video':
      return <DocMovie className={`fill-aqua ${cls}`} style={style} />
    case 'text':
      return <DocText className={`fill-aqua ${cls}`} style={style} />
    case 'image':
      return <DocPicture className={`fill-aqua ${cls}`} style={style} />
    default:
      return <Doc className={`fill-aqua ${cls}`} style={style} />
  }
}
