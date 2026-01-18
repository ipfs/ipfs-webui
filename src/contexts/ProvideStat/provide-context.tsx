import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useBridgeSelector } from '../../helpers/context-bridge'
import { useAgentVersionMinimum } from '../../lib/hooks/use-agent-version-minimum'
import type { KuboRPCClient } from 'kubo-rpc-client'
import type { ProvideStats, ProvideStatOptions } from './types'
import { getProvideStats } from './api'

export interface ProvideContextValue {
  data: ProvideStats | null
  loading: boolean
  error: Error | null
  lastUpdated: number | null
  refresh: (options?: ProvideStatOptions) => Promise<void>
  isAgentVersionSupported: boolean
}

const ProvideContext = createContext<ProvideContextValue | undefined>(undefined)
ProvideContext.displayName = 'ProvideContext'

export const ProvideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ipfs = useBridgeSelector('selectIpfs') as KuboRPCClient
  const ipfsConnected = useBridgeSelector('selectIpfsConnected') as boolean

  const { ok: isAgentVersionSupported } = useAgentVersionMinimum({
    minimumVersion: '0.39.0',
    requiredAgent: 'kubo'
  })

  const [data, setData] = useState<ProvideStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const refresh = useCallback(async (options: ProvideStatOptions = { all: true }) => {
    if (!ipfs || !ipfsConnected || !isAgentVersionSupported) return

    setLoading(true)
    try {
      const stats = await getProvideStats(ipfs, options)
      setData(stats)
      setError(null)
      setLastUpdated(Date.now())
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [ipfs, ipfsConnected, isAgentVersionSupported])

  // Auto-refresh every 60s
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  const value = useMemo<ProvideContextValue>(() => ({
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    isAgentVersionSupported
  }), [data, loading, error, lastUpdated, refresh, isAgentVersionSupported])

  return (
    <ProvideContext.Provider value={value}>
      {children}
    </ProvideContext.Provider>
  )
}

export function useProvide (): ProvideContextValue {
  const ctx = useContext(ProvideContext)
  if (!ctx) {
    throw new Error('useProvide must be used within a ProvideProvider')
  }
  return ctx
}
