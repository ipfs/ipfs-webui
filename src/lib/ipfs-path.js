import * as isIPFS from 'is-ipfs'

/**
 * Normalize input to a canonical path format:
 * - ipfs://CID/path -> /ipfs/CID/path
 * - ipns://name/path -> /ipns/name/path
 * - Bare CID -> /ipfs/CID
 * - Existing paths pass through unchanged
 * @param {string} input
 * @returns {string}
 */
export const normalizeToPath = (input) => {
  const trimmed = input.trim()
  if (trimmed.startsWith('ipfs://')) {
    return '/ipfs/' + trimmed.slice(7)
  }
  if (trimmed.startsWith('ipns://')) {
    return '/ipns/' + trimmed.slice(7)
  }
  if (isIPFS.cid(trimmed)) {
    return '/ipfs/' + trimmed
  }
  return trimmed
}

/**
 * Check if input is a valid IPFS/IPNS path, CID, or protocol URL.
 * @param {string} input
 * @returns {boolean}
 */
export const isValidIpfsPath = (input) => {
  const trimmed = input.trim()
  if (trimmed === '') return false

  if (trimmed.startsWith('ipfs://') || trimmed.startsWith('ipns://')) {
    const asPath = normalizeToPath(trimmed)
    return isIPFS.path(asPath)
  }

  return isIPFS.cid(trimmed) || isIPFS.path(trimmed)
}
