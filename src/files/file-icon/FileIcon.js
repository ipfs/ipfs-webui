import React from 'react'
import typeFromExt from '../type-from-ext'

import Folder from '../../icons/GlyphFolder'
import Doc from '../../icons/GlyphDocGeneric'
import DocMovie from '../../icons/GlyphDocMovie'
import DocCalc from '../../icons/GlyphDocCalc'
import DocMusic from '../../icons/GlyphDocMusic'
import DocPicture from '../../icons/GlyphDocPicture'
import DocText from '../../icons/GlyphDocText'

const style = { width: 36 }

export default function FileIcon ({ name, type, cls = '' }) {
  if (type === 'directory') {
    return <Folder className={`fill-aqua ${cls}`} style={style} />
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
