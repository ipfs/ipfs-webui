import HTML5Backend from 'react-dnd-html5-backend'
import fileReader from 'pull-file-reader'
import { join } from 'path'

const getFileFromEntry = (entry) => new Promise((resolve, reject) => {
  if (entry.file) {
    entry.file(resolve, reject)
  } else {
    resolve(null)
  }
}).catch(() => null)

const getAsEntry = (item) => item.getAsEntry ?
  item.getAsEntry() :
  item.webkitGetAsEntry ?
    item.webkitGetAsEntry() :
    null

const readEntries = (reader) => new Promise((resolve, reject) => {
  reader.readEntries(resolve, reject)
})

async function scanFiles (item, root = '') {
  if (!item.isDirectory) {
    const file = await getFileFromEntry(item)

    return [{
      name: join(root, file.webkitRelativePath || file.name),
      content: fileReader(file),
      size: file.size
    }]
  }

  let files = []
  const reader = item.createReader()
  const entries = await readEntries(reader)

  for (const entry of entries) {
    files = files.concat(await scanFiles(entry, join(root, item.name)))
  }

  return files
}

async function scan (files) {
  let entries = []
  let streams = []
  let totalSize = 0

  for (const file of files) {
    if (file.getAsEntry || file.webkitGetAsEntry) {
      entries.push({
        entry: getAsEntry(file),
        name: file.name
      })
    } else {
      totalSize += file.size

      streams.push({
        name: file.webkitRelativePath || file.name,
        content: fileReader(file),
        size: file.size
      })
    }
  }

  for (const entry of entries) {
    const res = await scanFiles(entry.entry, entry.name)
    res.forEach(r => { totalSize += r.size })
    streams = streams.concat(res)
  }

  return { streams, totalSize, isDir: false }
}

export default (manager) => {
  const backend = HTML5Backend(manager)
  const handler = backend.handleTopDropCapture

  backend.handleTopDropCapture = (event) => {
    handler.call(backend, event)

    if (backend.currentNativeSource) {
      backend.currentNativeSource.item.content = scan(event.dataTransfer.items)
    }
  }

  return backend
}
