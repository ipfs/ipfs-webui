declare module 'ipfs' {
  import type { CID } from 'multiformats/cid'
  import type { Multiaddr } from '@multiformats/multiaddr'
  import type { Buffer } from 'buffer'

  declare export interface IPFSService extends CoreService {
    pin: PinService;
    files: FileService;
    name: NameService;
    object: ObjectService;
    config: ConfigService;

    stop(options?: TimeoutOptions): Promise<void>
  }

  declare export interface CoreService {
    cat(pathOrCID: string | CID, options?: CatOptions): AsyncIterable<Buffer>;
    ls(pathOrCID: string | CID, options?: ListOptions): AsyncIterable<ListEntry>;
    add(file: FileContent | FileObject, options?: AddOptions): Promise<UnixFSEntry>;
    addAll(files: Iterable<FileContent | FileObject> | AsyncIterable<FileContent | FileObject> | ReadableStream<FileContent | FileObject>, options?: AddOptions): AsyncIterable<UnixFSEntry>;
  }

  declare export interface PinService {
    add(cid: CID, options?: PinAddOptions): Promise<Pin[]>;
    ls(options?: PinListOptions): AsyncIterable<PinEntry>;
    rm(cid: CID, options?: PinRemoveOptions): Promise<Pin[]>;
    remote: RemotePinService;
  }

  declare export interface RemotePinServicesOptions {
    cid: CID[];
    service: string;
  }
  declare export interface RemotePinService {
    rm(options: RemotePinServicesOptions): Promise<boolean>;
  }

  declare export interface FileService {
    stat(path: string, options?: FSStatOptions): Promise<FileStat>;
    cp(from: string, to: string, options?: FSCopyOptions): Promise<void>;
    mv(from: string, to: string, options?: FSMoveOptions): Promise<void>;
    rm(path: string, options: FSRemoveOptions): Promise<void>;
    mkdir(path: string, options: FSMakDirectoryOptions): Promise<void>;
  }

  declare export interface ConfigService {
    get(key: string, options?: TimeoutOptions): Promise<Object>;
    getAll(options?: TimeoutOptions): Promise<Object>;
    set(key: string, value: string | number | null | boolean | Object, options?: TimeoutOptions): Promise<void>;
    replace(config: Object, options?: TimeoutOptions): Promise<void>;

    profiles: ConfigProfiles;
  }

  declare export interface ConfigProfiles {
    list(options?: TimeoutOptions): Promise<Array<{ name: string, description: string }>>;
    apply(name: string, options?: { dryRun?: boolean } & TimeoutOptions): Promise<{ original: Object, updated: Object }>;
  }

  declare export interface NameService {
    resolve(value: string, options?: NameResloveOptions): AsyncIterable<string>
  }

  declare export interface SwarmService {
    connect(addr: Multiaddr, options?: TimeoutOptions): Promise<void>
  }

  declare export interface ObjectService {
    new: (options?: ObjectNewOptions) => Promise<CID>;
    patch: ObjectPatchService
  }

  declare export interface ObjectPatchService {
    addLink(cid: CID, link: DAGLink, options?: TimeoutOptions): Promise<CID>
  }

  declare export type DAGLink = {
    name: string,
    size: number,
    cid: CID
  }

  declare export type Pin = { cid: CID }

  declare export type TimeoutOptions = {
    timeout?: number,
    signal?: AbortSignal
  }

  declare export type PinAddOptions = TimeoutOptions & {
    recursive?: boolean,
  }

  declare export type PinType =
    | "recursive"
    | "direct"
    | "indirect"

  declare export type PinEntry = {
    cid: CID,
    typ: PinType
  }

  declare export type PinListOptions = TimeoutOptions & {
    paths?: string | CID | string[] | CID[],
    type?: PinType
  }

  declare export type PinRemoveOptions = TimeoutOptions & {
    recursive?: boolean
  }

  declare export type FSStatOptions = TimeoutOptions & {
    hash?: boolean,
    size?: boolean,
    withLocal?: boolean
  }

  declare export type FSCopyOptions = TimeoutOptions & {
    parents?: boolean,
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }

  declare export type FSMoveOptions = TimeoutOptions & {
    parents?: boolean,
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }

  declare export type FSRemoveOptions = TimeoutOptions & {
    recursive?: boolean,
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }

  declare export type FSMakDirectoryOptions = TimeoutOptions & {
    parents?: boolean,
    mode?: number,
    mtime?: UnixFSTime | Date | [number, number],
    flush?: boolean,
    hashAlg?: string,
    cidVersion?: number
  }

  declare export type FileType =
    | 'file'
    | 'directory'

  declare export interface FileStat {
    cid: CID;
    size: number;
    cumulativeSize: number;
    type: FileType;
    blocks: number;
    withLocality: boolean;
    local: boolean;
    sizeLocal: number;
  }

  declare export type NameResloveOptions = TimeoutOptions & {
    recursive?: boolean,
    nocache?: boolean
  }

  declare export type ObjectNewOptions = TimeoutOptions & {
    template?: string,
    recursive?: boolean,
    nocache?: boolean
  }

  declare export type CatOptions = TimeoutOptions & {
    offset?: number;
    length?: number;
  }

  declare export type ListOptions = TimeoutOptions & {

  }

  declare export type ListEntry = {
    depth: number,
    name: string,
    path: string,
    size: number,
    cid: CID,
    // IPFS is pretty inconsistent with type field see
    // https://github.com/ipfs/js-ipfs/issues/3229
    type: FileType | 'dir',
    mode: number,
    mtime: { secs: number, nsecs?: number }
  }

  declare type FileContent =
    | Uint8Array
    | Blob
    | String
    | AsyncIterable<Uint8Array>
    | ReadableStream<Uint8Array>

  declare type FileObject = {
    path?: string,
    content?: FileContent,
    mode?: number | string,
    mtime?: Date | UnixFSTime | [number, number]
  }

  declare export type AddOptions = TimeoutOptions & {
    chunker?: string,
    cidVersion?: number,
    hashAlg?: number,
    onlyHash?: boolean,
    pin?: boolean,
    progress?: (bytes: number, name:string) => void,
    rawLeaves?: boolean,
    trickle?: boolean,
    wrapWithDirectory?: boolean,
    onUploadProgress?: (progress: LoadProgress) => void,
    onDownloadProgress?: (progress: LoadProgress) => void
  }

  declare type LoadProgress = {
    total: number,
    loaded: number,
    lengthComputable: boolean
  }

  declare export type UnixFSEntry = {
    path: string,
    cid: CID,
    mode: number,
    mtime: UnixFSTime,
    size: number
  }

  declare export type UnixFSTime = {
    secs: number,
    nsecs: number
  }

  declare export var IPFS: IPFSService
}
