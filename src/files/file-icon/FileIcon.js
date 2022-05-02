import React from 'react'
import typeFromExt from '../type-from-ext'

// import FolderIcon from '../../icons/retro/files/FolderIcon'
import FolderListIcon from '../../icons/retro/files/FolderListIcon'
import UnknownIcon from '../../icons/retro/files/UnknownIcon'
import AudioIcon from '../../icons/retro/files/AudioIcon'
import CalcIcon from '../../icons/retro/files/CalcIcon'
import MovieIcon from '../../icons/retro/files/MovieIcon'
import TextIcon from '../../icons/retro/files/TextIcon'
// import ImageIcon from '../../icons/retro/files/ImageIcon'
import FileImageIcon from '../../icons/retro/FileImageIcon'
import FileGenIcon from '../../icons/retro/FileGenIcon'

// import DefaultFileIcon from '../../icons/retro/files/DefaultFileIcon'

const style = { width: 36 }

export default function FileIcon ({ name, type, cls = '' }) {
  if (type === 'directory') {
    return <FolderListIcon className={`fill-aqua ${cls}`} style={style} />
  }

  if (type === 'unknown') {
    return <UnknownIcon className={`fill-aqua ${cls}`} style={style} />
  }

  switch (typeFromExt(name)) {
    case 'audio':
      return <AudioIcon className={`fill-aqua ${cls}`} style={style} />
    case 'calc':
      return <CalcIcon className={`fill-aqua ${cls}`} style={style} />
    case 'video':
      return <MovieIcon className={`fill-aqua ${cls}`} style={style} />
    case 'text':
      return <TextIcon className={`fill-aqua ${cls}`} style={style} />
    case 'image':
      return <FileImageIcon className={`fill-aqua ${cls}`} style={style} />
    default:
      return <FileGenIcon className={`fill-aqua ${cls}`} style={style} />
  }
}
