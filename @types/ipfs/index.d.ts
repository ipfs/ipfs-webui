declare module "ipfs" {
  import CID from "cids"
  import Multiaddr from 'multiaddr'
  import { Buffer } from "buffer"

  export interface IPFSService extends CoreService {
    pin: PinService
    files: FileService
    name: NameService
    object: ObjectService
  }

  export interface CoreService {
    cat(pathOrCID: string | CID, options?: CatOptions): AsyncIterable<Buffer>
    ls(pathOrCID: string | CID, options?: ListOptions): AsyncIterable<ListEntry>
    add(file: FileContent | FileObject, options?: AddOptions): Promise<UnixFSEntry>
    addAll(files: Iterable<FileContent | FileObject> | AsyncIterable<FileContent | FileObject> | ReadableStream<FileContent | FileObject>, options?: AddOptions): AsyncIterable<UnixFSEntry>
  }

  export interface PinService {
    add(cid: CID, options?: PinAddOptions): Promise<Pin[]>
    ls(options?: PinListOptions): AsyncIterable<PinEntry>
    rm(cid: CID, options?: PinRemoveOptions): Promise<Pin[]>
  }

  export interface FileService {
    stat(path: string, options?: FSStatOptions): Promise<FileStat>
    cp(from: string, to: string, options?: FSCopyOptions): Promise<void>
    mv(from: string, to: string, options?: FSMoveOptions): Promise<void>
    rm(path: string, options: FSRemoveOptions): Promise<void>
    mkdir(path: string, options: FSMakDirectoryOptions): Promise<void>
  }

  export interface NameService {
    resolve(value: string, options?: NameResloveOptions): AsyncIterable<string>
  }

  export interface SwarmService {
    connect(addr: Multiaddr, options?: TimeoutOptions): Promise<void>
  }

  export interface ObjectService {
    new: (options?: ObjectNewOptions) => Promise<CID>
    patch: ObjectPatchService
  }

  export interface ObjectPatchService {
    addLink(cid: CID, link: DAGLink, options?: TimeoutOptions): Promise<CID>
  }

  export type DAGLink = {
    name: string,
    size: number,
    cid: CID
  }

  export type Pin = { cid: CID }

  export type TimeoutOptions = {
    timeout?: number,
    signal?: AbortSignal
  }

  export type PinAddOptions = TimeoutOptions & {
    recursive?: boolean,
  }

  export type PinType =
    | "recursive"
    | "direct"
    | "indirect"

  export type PinEntry = {
    cid: CID,
    typ: PinType
  }

  export type PinListOptions = TimeoutOptions & {
    paths?: string | CID | string[] | CID[],
    type?: PinType
  }

  export type PinRemoveOptions = TimeoutOptions & {
    recursive?: boolean
  }



  export type FSStatOptions = TimeoutOptions & {
    hash?: boolean,
    size?: boolean,
    withLocal?: boolean
  }



  export type FSCopyOptions = TimeoutOptions & {
    parents?: boolean,
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }

  export type FSMoveOptions = TimeoutOptions & {
    parents?: boolean,
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }



  export type FSRemoveOptions = TimeoutOptions & {
    recursive?: boolean,
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }

  export type FSMakDirectoryOptions = TimeoutOptions & {
    parents?: boolean,
    mode?: number,
    mtime?: UnixFSTime | Date | [number, number],
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }

  export type FileType =
    | 'file'
    | 'dir'

  export interface FileStat {
    cid: CID
    size: number
    cumulativeSize: number
    type: FileType
    blocks: number
    withLocality: boolean
    local: boolean
    sizeLocal: number
  }


  export type NameResloveOptions = TimeoutOptions & {
    recursive?: boolean,
    nocache?: boolean
  }

  export type ObjectNewOptions = TimeoutOptions & {
    template?: string,
    recursive?: boolean,
    nocache?: boolean
  }

  export type CatOptions = TimeoutOptions & {
    offset?: number
    length?: number
  }

  export type ListOptions = TimeoutOptions & {

  }

  export type ListEntry = {
    depth: number,
    name: string,
    path: string,
    size: number,
    cid: CID,
    type: FileType,
    mode: number,
    mtime: { secs: number, nsecs?: number }
  }


  type FileContent =
    | Uint8Array
    | Blob
    | String
    | AsyncIterable<Uint8Array>
    | ReadableStream<Uint8Array>

  type FileObject = {
    path?: string,
    content?: FileContent,
    mode?: number | string,
    mtime?: Date | UnixFSTime | [number, number]
  }

  export type AddOptions = TimeoutOptions & {
    chunker?: string,
    cidVersion?: number,
    hashAlg?: number,
    onlyHash?: boolean,
    pin?: boolean,
    progress?: (bytes: number) => void,
    rawLeaves?: boolean,
    trickle?: boolean,
    wrapWithDirectory?: boolean
  }

  export type UnixFSEntry = {
    path: string,
    cid: CID,
    mode: number,
    mtime: UnixFSTime,
    size: number
  }


  export type UnixFSTime = {
    secs: number,
    nsecs: number
  }


  export var IPFS: IPFSService
}