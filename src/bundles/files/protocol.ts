import { Pin } from 'ipfs'
import CID from 'cids'

export type Model = {
  pageContent: null | PageContent
  pins: CID[]
  sorting: Sorting
  mfsSize: number

  pending: PendingJob<any>[]
  finished: FinishedJob<any>[]
  failed: FailedJob[]
}

export type PendingJob<T> =
  | IdleJob
  | ActiveJob<T>

export interface JobInfo {
  type: Message['type']
  id: Symbol
  start: number
}

export interface IdleJob extends JobInfo {
  status: 'Idle'
}

export interface ActiveJob<T> extends JobInfo {
  status: 'Active'
  state: T
}

export interface FailedJob extends JobInfo {
  status: 'Failed'
  error: Error
  end: number
}

export interface FinishedJob<T> extends JobInfo {
  status: 'Done'
  value: T
  end: number
}


export type Sorting = {
  by: SortBy,
  asc: boolean
}

export type SortBy = 'name' | 'size'

export type Message =
  | { type: 'FILES_CLEAR_ALL' }
  | { type: 'FILES_DISMISS_ERRORS' }
  | { type: 'FILES_UPDATE_SORT', payload: Sorting }
  | Job<'FILES_FETCH', never, Error, PageContent>
  | Job<'FILES_DELETE', never, Error, void>
  | Job<'FILES_ADDBYPATH', never, Error, void>
  | Job<'FILES_DOWNLOADLINK', never, Error, FileDownload>
  | Job<'FILES_SHARE_LINK', never, Error, string>
  | Job<'FILES_MOVE', never, Error, void>
  | Job<'FILES_COPY', never, Error, void>
  | Job<'FILES_MAKEDIR', never, Error, void>
  | Job<'FILES_PIN_ADD', never, Error, Pin[]>
  | Job<'FILES_PIN_REMOVE', never, Error, Pin[]>
  | Job<'FILES_PIN_LIST', never, Error, { pins: CID[] }>
  | Job<'FILES_SIZE_GET', never, Error, { size: number }>
  | Job<'FILES_WRITE', { paths: string[], progress: number }, Error, void>


export type FileDownload = {
  url: string
  filename: string
}

type FileType = 'directory' | 'file' | 'unknown'

type Time = number

type FileStat = {
  size: number,
  type: FileType,
  cid: CID,
  name: string,
  path: string,
  pinned: boolean
  isParent: boolean | void
}

export type PageContent =
  | UnknownContent
  | FileContent
  | DirectoryContent

type UnknownContent = {
  type: 'unknown',
  fetched: Time,
  path: string,
  cid: CID,
  size: 0
}

type FileContent = {
  type: 'file',
  fetched: Time,
  path: string,
  cid: CID,
  size: number,

  name: string,
  pinned: boolean
}

type DirectoryContent = {
  type: 'directory',
  fetched: Time,
  path: string,
  cid: CID,

  content: FileStat[]
  upper: void | FileStat,
}

export type Job<K, P, X, T> = {
  type: K,
  job: JobState<P, X, T>
}

export type JobState<P, X, T> =
  | { status: 'Idle', id: Symbol }
  | { status: 'Active', id: Symbol, state: P }
  | { status: 'Failed', id: Symbol, error: X }
  | { status: 'Done', id: Symbol, value: T }


