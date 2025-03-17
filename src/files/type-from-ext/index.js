import fileExtension from 'file-extension'
import extToType from './ext-to-type.js'

function fileType (filename) {
  const ext = fileExtension(filename)
  return extToType[ext] || ext
}
export default fileType
