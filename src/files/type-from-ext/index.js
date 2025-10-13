// @ts-expect-error - file-extension is not typed
import fileExtension from 'file-extension'
import extToType from './extToType.js'

/**
 * @param {string} filename
 * @returns {string}
 */
function fileType (filename) {
  const ext = fileExtension(filename)
  return extToType[ext] || ext
}
export default fileType
