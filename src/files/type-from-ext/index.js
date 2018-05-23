import fileExtension from 'file-extension'
import audioExtensions from './extensions/audio.json'
import calcExtensions from './extensions/calc.json'
import imageExtensions from './extensions/image.json'
import videoExtensions from './extensions/video.json'
import textExtensions from './extensions/text.json'

export default function FileIcon (filename) {
  const ext = fileExtension(filename)

  if (ext === 'pdf') {
    return 'pdf'
  } else if (audioExtensions.includes(ext)) {
    return 'audio'
  } else if (calcExtensions.includes(ext)) {
    return 'calc'
  } else if (imageExtensions.includes(ext)) {
    return 'image'
  } else if (videoExtensions.includes(ext)) {
    return 'video'
  } else if (textExtensions.includes(ext)) {
    return 'text'
  }

  return 'blob'
}
