import React from 'react'
import typeFromExt from '../type-from-ext'

import Folder from '../../icons/GlyphFolder'
import Doc from '../../icons/StrokeDocument'
import DocMovie from '../../icons/GlyphDocMovie'
import DocCalc from '../../icons/GlyphDocCalc'
import DocMusic from '../../icons/GlyphDocMusic'
import DocPicture from '../../icons/GlyphDocPicture'
import DocText from '../../icons/GlyphDocText'

export default function FileIcon ({name, type}) {
  if (type === 'directory') {
    return <Folder className=' fill-aqua' width='2.5rem' />
  }

  switch (typeFromExt(name)) {
    case 'audio':
      return <DocMusic className='fill-aqua' width='2.5rem' />
    case 'calc':
      return <DocCalc className='fill-aqua' width='2.5rem' />
    case 'video':
      return <DocMovie className='fill-aqua' width='2.5rem' />
    case 'text':
      return <DocText className='fill-aqua' width='2.5rem' />
    case 'image':
      return <DocPicture className='fill-aqua' width='2.5rem' />
    default:
      return <Doc className='fill-aqua' width='2.5rem' />
  }
}
