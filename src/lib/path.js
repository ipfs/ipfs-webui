/*
  Capture groups 1
  1: ipns | ipfs | ipld
  2: CID | fqdn
  3: /rest
*/

const pathRegEx = /(\/(ipns|ipfs|ipld)\/)?([^/]+)(\/.*)?/

export function quickSplitPath (str) {
  const res = pathRegEx.exec(str)
  if (!res) return null
  return {
    namespace: res[2], // 'ipfs'
    cidOrFqdn: res[3], // 'QmHash'
    rest: res[4], // /foo/bar
    address: res[0] // /ipfs/QmHash/foo/bar
  }
}

export function join (a, b) {
  if (a.endsWith('/')) a = a.slice(0, -1)
  if (b.startsWith('/')) b = b.slice(1)
  return `${a}/${b}`
}
