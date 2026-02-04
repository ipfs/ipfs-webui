import type { KuboRPCClient } from 'kubo-rpc-client'
import type { ProvideStatOptions, ProvideStats } from './types'

export async function getProvideStats (
  ipfs: KuboRPCClient,
  options: ProvideStatOptions = { all: true }
): Promise<ProvideStats> {
  return ipfs.provide.stat(options)
}
