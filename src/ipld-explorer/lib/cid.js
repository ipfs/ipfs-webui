import CID from 'cids'

export function toCidOrNull (value) {
  if (!value) return null
  try {
    return new CID(value)
  } catch (err) {
    console.log('Failed to parse CID', value, err)
    return null
  }
}

export function getCodecOrNull (value) {
  const cid = toCidOrNull(value)
  return cid ? cid.codec : null
}

export function toCidStrOrNull (value) {
  const cid = toCidOrNull(value)
  return cid ? cid.toString() : null
}
