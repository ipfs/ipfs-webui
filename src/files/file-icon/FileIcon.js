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
