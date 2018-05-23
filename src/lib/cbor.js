import {toCidStrOrNull} from './dag'

export function isPathInThisNode (node, path) {
  if (!path) return true
  if (!node) return false

  const parts = path.split('/').filter(p => !!p)
  if (parts.length === 0) return true
  let current = node
  return parts.every(p => {
    current = current[p]
    return current && !current['/']
  }, node)
}

export function findFirstLinkInPath (node, path) {
  if (!path) return null
  if (!node) return null
  const parts = path.split('/').filter(p => !!p)
  if (parts.length === 0) return null
  let current = node
  let link = null
  let index = 0
  while (current && !link) {
    const p = parts[index++]
    current = current[p]
    link = current ? toCidStrOrNull(current['/']) : null
  }
  return link
}
