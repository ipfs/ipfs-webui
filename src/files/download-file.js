const downloadFile = (srcUrl, filename, progressCallback, method = 'GET') => {
  const xhr = new window.XMLHttpRequest()
  let total = 0

  const abort = () => {
    xhr.abort()
    progressCallback(null)
  }

  xhr.responseType = 'blob'
  xhr.open(method, srcUrl, true)

  xhr.onload = (e) => {
    progressCallback(100)

    const res = xhr.response
    const blob = new window.Blob([res])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    document.body.appendChild(a)
    a.style = 'display:none'
    a.href = url
    a.download = filename
    a.click()

    window.URL.revokeObjectURL(url)
    progressCallback(null)
  }

  xhr.onprogress = (e) => {
    total = e.lengthComputable ? e.total : (total ||
      xhr.getResponseHeader('X-Content-Length') ||
      xhr.getResponseHeader('Content-Length'))

    progressCallback((e.loaded / total) * 100)
  }

  xhr.send()
  return { abort }
}
export default downloadFile
