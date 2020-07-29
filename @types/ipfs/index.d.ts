declare module "ipfs" {
  import CID from "cids"
  import Multiaddr from 'multiaddr'

  interface IPFSService extends CoreService {
    pin: PinService
    files: FileService
    name: NameService
  }

  interface CoreService {
    cat(pathOrCID: string | CID, options?: CatOptions): AsyncIterable<Buffer>
    ls(pathOrCID: string | CID, options?: ListOptions): AsyncIterable<ListEntry>
  }

  interface PinService {
    add(cid: CID, options?: PinAddOptions): Promise<Pin[]>
    ls(options?: PinListOptions): AsyncIterable<PinEntry>
    rm(cid: CID, options?: PinRemoveOptions): Promise<Pin[]>
  }

  interface FileService {
    stat(path: string, options?: FSStatOptions): Promise<FileStat>
  }

  interface NameService {
    resolve(value: string, options?: NameResloveOptions): AsyncIterable<string>
  }

  interface SwarmService {
    connect(addr: Multiaddr, options?: TimeoutOptions): Promise<void>
  }


  type Pin = { cid: CID }

  type TimeoutOptions = {
    timeout?: number,
    signal?: AbortSignal
  }

  type PinAddOptions = TimeoutOptions & {
    recursive?: boolean,
  }

  type PinType =
    | "recursive"
    | "direct"
    | "indirect"

  type PinEntry = {
    cid: CID,
    typ: PinType
  }

  type PinListOptions = TimeoutOptions & {
    paths?: string | CID | string[] | CID[],
    type?: PinType
  }

  type PinRemoveOptions = TimeoutOptions & {
    recursive?: boolean
  }



  type FSStatOptions = TimeoutOptions & {
    hash?: boolean,
    size?: boolean,
    withLocal?: boolean
  }

  type FileType =
    | 'file'
    | 'directory'

  interface FileStat {
    cid: CID
    size: number
    cumulativeSize: number
    type: FileType
    blocks: number
    withLocality: boolean
    local: boolean
    sizeLocal: number
  }


  type NameResloveOptions = TimeoutOptions & {
    recursive?: boolean,
    nocache?: boolean
  }

  type CatOptions = TimeoutOptions & {
    offset?: number
    length?: number
  }

  type ListOptions = TimeoutOptions & {

  }

  type ListEntry = {
    depth: number,
    name: string,
    path: string,
    size: number,
    cid: CID,
    type: FileType,
    mode: number,
    mtime: { secs: number, nsecs?: number }
  }


  export { IPFSService, CoreService, PinService, FileService, NameService, CID, Pin }
  declare var ipfs: IPFSService
  declare export default ipfs
}