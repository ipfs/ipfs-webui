export function fileExtension (name, defaultExt = '?') {
  if (!name) {
    return defaultExt
  }

  const ext = name.split('.').pop()

  if (ext === name) {
    return defaultExt
  } else {
    return ext.toUpperCase()
  }
}

export function readAsBuffer (file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader()
    reader.onload = (event) => {
      resolve({
        content: Buffer.from(reader.result),
        name: file.name
      })
    }
    reader.onerror = (event) => {
      reject(reader.error)
    }

    reader.readAsArrayBuffer(file)
  })
}
