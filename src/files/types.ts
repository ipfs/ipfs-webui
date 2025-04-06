import { CID } from 'multiformats/cid'

export interface ContextMenuFile {
  name: string
  size: number
  type: string
  cid: CID
  path: string
  pinned: boolean
}
