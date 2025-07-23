import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react'
import { useBridgeContext, useBridgeSelector } from '../helpers/context-bridge'

/**
 * Identity data structure
 */
export interface IdentityData {
  /** The IPFS peer ID */
  id?: string
  /** The public key */
  publicKey?: string
  /** List of multiaddresses */
  addresses?: string[]
  /** Agent version */
  agentVersion?: string
  /** Protocol version */
  protocolVersion?: string
}

/**
 * Identity context value
 */
export interface IdentityContextValue {
  /** The identity data, undefined if not loaded */
  identity?: IdentityData
  /** Whether identity is currently being fetched */
  isLoading: boolean
  /** Whether there was an error fetching identity */
  hasError: boolean
  /** Last successful fetch timestamp */
  lastSuccess?: number
  /** Function to manually refetch identity */
  refetch: () => void
}

/**
 * Identity state for the reducer
 */
interface IdentityState {
  identity?: IdentityData
  isLoading: boolean
  hasError: boolean
  lastSuccess?: number
}

/**
 * Actions for the identity reducer
 */
type IdentityAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { identity: IdentityData; timestamp: number } }
  | { type: 'FETCH_ERROR' }

/**
 * Identity reducer
 */
function identityReducer (state: IdentityState, action: IdentityAction): IdentityState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        hasError: false
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        identity: action.payload.identity,
        isLoading: false,
        hasError: false,
        lastSuccess: action.payload.timestamp
      }
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        hasError: true
      }
    default:
      return state
  }
}

/**
 * Initial state
 */
const initialState: IdentityState = {
  identity: undefined,
  isLoading: false,
  hasError: false,
  lastSuccess: undefined
}

/**
 * Identity context
 */
const IdentityContext = createContext<IdentityContextValue | undefined>(undefined)
IdentityContext.displayName = 'IdentityContext'

/**
 * Identity Provider Props
 */
interface IdentityProviderProps {
  children: ReactNode
  /** Whether to poll for identity updates every 5 seconds (default: false) */
  shouldPoll?: boolean
}

/**
 * Identity provider component using context bridge for redux selectors
 */
const IdentityProviderImpl: React.FC<IdentityProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(identityReducer, initialState)
  const shouldPoll = useBridgeSelector<boolean>('selectIsNodeInfoOpen') || false

  // Access redux selectors through context bridge (reactive)
  const ipfsConnected = useBridgeSelector<boolean>('selectIpfsConnected') || false
  const ipfs = useBridgeSelector<any>('selectIpfs')

  /**
     * Fetch identity from IPFS
     */
  const fetchIdentity = useCallback(async () => {
    if (!ipfsConnected || !ipfs) {
      return
    }

    try {
      dispatch({ type: 'FETCH_START' })
      const identity = await ipfs.id()
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          identity,
          timestamp: Date.now()
        }
      })
    } catch (error) {
      console.error('Failed to fetch identity:', error)
      dispatch({ type: 'FETCH_ERROR' })
    }
  }, [ipfs, ipfsConnected])

  /**
     * Auto-fetch identity when IPFS becomes available or connected
     * Only fetches once on mount/connection, not repeatedly
     */
  useEffect(() => {
    if (ipfsConnected && !state.isLoading) {
      // Only fetch if we don't have identity or if connection was restored
      if (!state.identity || !state.lastSuccess) {
        fetchIdentity()
      }
    }
  }, [ipfsConnected, fetchIdentity, state.isLoading, state.identity, state.lastSuccess])

  /**
     * Periodic refresh of identity - only when shouldPoll is true
     * This should only be enabled when advanced node info is displayed
     */
  useEffect(() => {
    if (!shouldPoll || !ipfsConnected || !state.lastSuccess) {
      return
    }

    const REFRESH_INTERVAL = 5000 // Same as IDENTITY_REFRESH_INTERVAL_MS
    const timeSinceLastSuccess = Date.now() - state.lastSuccess

    if (timeSinceLastSuccess < REFRESH_INTERVAL) {
      // Set a timeout for the remaining time
      const timeout = setTimeout(fetchIdentity, REFRESH_INTERVAL - timeSinceLastSuccess)
      return () => clearTimeout(timeout)
    } else {
      // Time to refresh now
      fetchIdentity()
    }
  }, [shouldPoll, ipfsConnected, state.lastSuccess, fetchIdentity])

  const contextValue: IdentityContextValue = {
    identity: state.identity,
    isLoading: state.isLoading,
    hasError: state.hasError,
    lastSuccess: state.lastSuccess,
    refetch: fetchIdentity
  }

  // Bridge the context value to redux bundles
  useBridgeContext('identity', contextValue)

  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  )
}

/**
 * Hook to consume the identity context
 */
export function useIdentity (): IdentityContextValue {
  const context = useContext(IdentityContext)
  if (context === undefined) {
    throw new Error('useIdentity must be used within an IdentityProvider')
  }
  return context
}

/**
 * Identity provider component
 */
export const IdentityProvider = IdentityProviderImpl
