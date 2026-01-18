import type { HTTPRPCOptions } from 'kubo-rpc-client'
export interface LegacyProvideStats {
  total_reprovides: number
  avg_reprovide_duration: string
  last_reprovide_duration: string
  last_run?: string
  reprovide_interval?: string
}

export interface ProvideConnectivity {
  status: 'online' | 'disconnected'
  since: string
}

export interface ProvideQueues {
  pending_key_provides: number
  pending_region_provides: number
  pending_region_reprovides: number
}

export interface ProvideSchedule {
  keys: number
  regions: number
  avg_prefix_length: number
  next_reprovide_at: string
  next_reprovide_prefix: string
}

export interface ProvideWorkers {
  max: number
  active: number
  active_periodic: number
  active_burst: number
  dedicated_periodic: number
  dedicated_burst: number
  queued_periodic: number
  queued_burst: number
  max_provide_conns_per_worker: number
}

export interface ProvideTiming {
  uptime: number
  reprovides_interval: number
  cycle_start: string
  current_time_offset: number
  max_reprovide_delay: number
}

export interface ProvideOperations {
  ongoing: {
    key_provides: number
    region_provides: number
    key_reprovides: number
    region_reprovides: number
  }
  past: {
    keys_provided: number
    records_provided: number
    keys_failed: number
    keys_provided_per_minute?: number
    keys_reprovided_per_minute?: number
    region_reprovide_duration?: number
    avg_keys_per_reprovide?: number
    regions_reprovided_last_cycle?: number
  }
}

export interface ProvideNetwork {
  peers: number
  reachable: number
  complete_keyspace_coverage: boolean
  avg_region_size: number
  avg_holders: number
  replication_factor: number
}
export interface SweepProvideStats {
  closed: boolean
  connectivity: ProvideConnectivity
  queues: ProvideQueues
  schedule: ProvideSchedule
  workers: ProvideWorkers
  timing: ProvideTiming
  operations: ProvideOperations
  network: ProvideNetwork
}
export interface ProvideStatOptions extends HTTPRPCOptions {
  all?: boolean
  lan?: boolean
  compact?: boolean
  connectivity?: boolean
  network?: boolean
  queues?: boolean
  schedule?: boolean
  timing?: boolean
  workers?: boolean
  operations?: boolean
}

export interface ProvideStats {
  Sweep?: SweepProvideStats
  Legacy?: LegacyProvideStats | null
  FullRT?: boolean
}
