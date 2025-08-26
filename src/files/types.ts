import { CID } from 'multiformats/cid'

export interface ContextMenuFile {
  name: string
  size: number
  type: string
  cid: CID
  path: string
  pinned: boolean
}

export interface FileStream {
  path: string
  content: Blob
  size: number
}

export interface FileExt {
  filepath?: string
  webkitRelativePath?: string
}

export type ExtendedFile = File & FileExt
