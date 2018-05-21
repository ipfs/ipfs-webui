import React from 'react'
import fileExtension from 'file-extension'

import audioExtensions from './extensions/audio.json'
import calcExtensions from './extensions/calc.json'
import imageExtensions from './extensions/image.json'
import videoExtensions from './extensions/video.json'
import textExtensions from './extensions/text.json'

import Folder from '../../icons/GlyphFolder'
import Doc from '../../icons/StrokeDocument'
import DocMovie from '../../icons/GlyphDocMovie'
import DocCalc from '../../icons/GlyphDocCalc'
import DocMusic from '../../icons/GlyphDocMusic'
import DocPicture from '../../icons/GlyphDocPicture'
import DocText from '../../icons/GlyphDocText'

export default function (file) {
  const ext = fileExtension(file.name)

  if (file.type === 'directory') {
    return <Folder className=' fill-aqua' width='2.5rem' />
  }

  if (audioExtensions.includes(ext)) {
    return <DocMusic className='fill-aqua' width='2.5rem' />
  } else if (calcExtensions.includes(ext)) {
    return <DocCalc className=' fill-aqua' width='2.5rem' />
  } else if (imageExtensions.includes(ext)) {
    return <DocPicture className=' fill-aqua' width='2.5rem' />
  } else if (videoExtensions.includes(ext)) {
    return <DocMovie className=' fill-aqua' width='2.5rem' />
  } else if (textExtensions.includes(ext)) {
    return <DocText className=' fill-aqua' width='2.5rem' />
  }

  return <Doc className='fill-aqua' width='2.5rem' />
}
