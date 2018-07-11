import React from 'react'
import typeFromExt from '../type-from-ext'

import Folder from '../../icons/GlyphFolder'
import Doc from '../../icons/GlyphDocGeneric'
import DocMovie from '../../icons/GlyphDocMovie'
import DocCalc from '../../icons/GlyphDocCalc'
import DocMusic from '../../icons/GlyphDocMusic'
import DocPicture from '../../icons/GlyphDocPicture'
import DocText from '../../icons/GlyphDocText'

export default function FileIcon ({name, type}) {
  if (type === 'directory') {
    return <Folder className=' fill-aqua' style={{width: '2.5rem'}} />
  }

  switch (typeFromExt(name)) {
    case 'audio':
      return <DocMusic className='fill-aqua' style={{width: '2.5rem'}} />
    case 'calc':
      return <DocCalc className='fill-aqua' style={{width: '2.5rem'}} />
    case 'video':
      return <DocMovie className='fill-aqua' style={{width: '2.5rem'}} />
    case 'text':
      return <DocText className='fill-aqua' style={{width: '2.5rem'}} />
    case 'image':
      return <DocPicture className='fill-aqua' style={{width: '2.5rem'}} />
    default:
      return <Doc className='fill-aqua' style={{width: '2.5rem'}} />
  }
}
