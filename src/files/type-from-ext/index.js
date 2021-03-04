import fileExtension from 'file-extension'
import extToType from './extToType'

function fileType (filename) {
  const ext = fileExtension(filename)
  return extToType[ext] || ext
}
export default fileType
