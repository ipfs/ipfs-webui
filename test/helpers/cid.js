import { promisify } from 'util'
import Crypto from 'crypto'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as dagPb from '@ipld/dag-pb'

export async function fakeCid () {
  const randomBytesBuffer = await promisify(Crypto.randomBytes)(Math.round(Math.random() * 1000))
  const bytes = new Uint8Array(randomBytesBuffer)
  const mh = await sha256.digest(bytes)

  return CID.create(0, dagPb.code, mh)
}
