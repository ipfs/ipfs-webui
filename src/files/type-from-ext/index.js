import fileExtension from 'file-extension'
import extToType from './extToType'

export default function (filename) {
  const ext = fileExtension(filename)
  return extToType[ext] || ext
}
