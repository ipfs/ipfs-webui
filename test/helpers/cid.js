import multihashing from 'multihashing-async'
import CID from 'cids'
import { promisify } from 'util'
import Crypto from 'crypto'

export async function fakeCid () {
  const bytes = await promisify(Crypto.randomBytes)(Math.random() * 1000)
  const mh = await promisify(multihashing)(bytes, 'sha2-256')
  return new CID(0, 'dag-pb', mh)
}
