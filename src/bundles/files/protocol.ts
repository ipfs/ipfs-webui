import { Pin } from 'ipfs'
import type { CID } from 'multiformats/cid'
import { Perform, Spawn } from "../task"

export type { Perform, Spawn }

export type Model = {
  pageContent: null | PageContent
  pins: string[]
  sorting: Sorting
  mfsSize: number

  pending: PendingJob<any, any>[]
  finished: FinishedJob<any>[]
  failed: FailedJob[]
}


export interface JobInfo {
  type: Message['type']
  id: Symbol
  start: number
}


export interface PendingJob<M, I> extends JobInfo {
  status: 'Pending'
  init: I
  message?: M
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
  | Perform<'FILES_FETCH', Error, PageContent, void>
  | MakeDir
  | Delete
  | Move
  | Write
  | AddByPath
  | DownloadLink
  | Perform<'FILES_SHARE_LINK', Error, string, void>
  | Perform<'FILES_COPY', Error, void, void>
  | Perform<'FILES_PIN_ADD', Error, Pin[], void>
  | Perform<'FILES_PIN_REMOVE', Error, Pin[], void>
  | Perform<'FILES_PIN_LIST', Error, { pins: CID[] }, void>
  | Perform<'FILES_SIZE_GET', Error, { size: number }, void>
  | Perform<'FILES_PINS_SIZE_GET', Error, { pinsSize: number, numberOfPins: number }, void>

export type MakeDir = Perform<'FILES_MAKEDIR', Error, void, void>
export type WriteProgress = { paths: string[], progress: number }
export type Write = Spawn<'FILES_WRITE', WriteProgress, Error, void, void>
export type AddByPath = Perform<'FILES_ADDBYPATH', Error, void, void>
export type Move = Perform<'FILES_MOVE', Error, void, void>
export type Delete = Perform<'FILES_DELETE', Error, void, void>
export type DownloadLink = Perform<'FILES_DOWNLOADLINK', Error, FileDownload, void>

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

export type DirectoryContent = {
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


