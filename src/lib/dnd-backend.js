import { getFilesFromDataTransferItems } from 'datatransfer-files-promise'
import { HTML5Backend } from 'react-dnd-html5-backend'

// If you drop a dir "foo" which contains "cat.jpg" & "dog.png" we receive a
// single item in the `event.dataTransfer.items` for the directory.
//
// We use 'datatransfer-files-promise' to map the dir tree to a flat list of
// FileSystemEntry objects, each with a filepath propety, that captures the
// files relative path within the dir that was dropped.
//
// so the "foo" becomes:
// [
//  { filepath: 'foo/cat.jpg' name: 'cat.jpg', size: Number },
//  { filepath: 'foo/dog.png' name: 'dog.png', size: Number }
// ]
//
// Which is a useful shape for passing to ipfs.add, with the caveat that each
// FileSystemEntry object must be passed to pull-file-reader or similar to
// convert to a stream style that ipfs.add accepts.
//
// ReactDnD doesn't give the calling code access to the `event.dataTransfer.items`
// so we have to work around it here by plugin a custom drop handler that does
// the work to map from a dir entry to a flat list of files and then stash it on
//  a custom `filesPromise` prop on the return object, which we check for in our
//  dropTarget drop handler functions.
//
// See: https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
// See: https://github.com/grabantot/datatransfer-files-promise/blob/72b6cc763f9b400c59197bcc787268965310c260/index.js
const createBackend = (manager) => {
  const backend = HTML5Backend(manager)
  const handler = backend.handleTopDropCapture
  backend.handleTopDropCapture = (event) => {
    handler.call(backend, event)
    if (backend.currentNativeSource && event.dataTransfer.items) {
      // Prevent handling drag & drop of text inside webui
      if ([...event.dataTransfer.items].every(({ kind }) => kind === 'string')) return

      const filesPromise = getFilesFromDataTransferItems(event.dataTransfer.items)
      backend.currentNativeSource.item.filesPromise = filesPromise
    }
  }
  return backend
}
export default createBackend
