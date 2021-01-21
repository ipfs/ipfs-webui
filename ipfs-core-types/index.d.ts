// Workaround https://github.com/ipfs/js-ipfs/issues/3494
declare module 'ipfs-core-types' {
  import type { RootAPI as $RootAPI } from 'ipfs-core-types/src/root'
  import type { AbortOptions as $AbortOptions, Await as $Await, AwaitIterable as $AwaitIterable } from 'ipfs-core-types/src/basic'

  declare export interface RootAPI extends $RootAPI {}
  declare export interface AbortOptions extends $AbortOptions {}
  declare export type Await<T> = $Await<T>
  declare export type AwaitIterable<T> = $AwaitIterable<T>
}
