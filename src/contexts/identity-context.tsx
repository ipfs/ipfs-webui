import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode, useRef } from 'react'
import { AgentVersionObject, parseAgentVersion } from 'src/lib/parse-agent-version'
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
  /** Whether identity is being fetched for the first time */
  isLoading: boolean
  /** Whether there was an error fetching identity */
  hasError: boolean
  /** Last successful fetch timestamp */
  lastSuccess?: number
  /** Function to manually refetch identity */
  refetch: () => void
  /**
   * Whether identity is being updated (loading, but we already have a good identity response)
   */
  isRefreshing: boolean
  /**
   * The parsed agent version object
   */
  agentVersionObject: AgentVersionObject | null
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
}

/**
 * Identity provider component using context bridge for redux selectors
 */
const IdentityProviderImpl: React.FC<IdentityProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(identityReducer, initialState)
  const shouldPoll = useBridgeSelector<boolean>('selectIsNodeInfoOpen') || false
  const ipfsConnected = useBridgeSelector<boolean>('selectIpfsConnected') || false
  const ipfs = useBridgeSelector<any>('selectIpfs')

  // keep last good identity to prevent UI flash
  const lastGoodIdentityRef = useRef<IdentityData | undefined>(state.identity)
  useEffect(() => {
    if (state.identity) lastGoodIdentityRef.current = state.identity
  }, [state.identity])

  const identityStable = state.identity ?? lastGoodIdentityRef.current
  const isInitialLoading = identityStable == null && state.isLoading
  const isRefreshing = identityStable != null && state.isLoading

  const fetchIdentity = useCallback(async () => {
    if (!ipfsConnected || !ipfs) return
    try {
      dispatch({ type: 'FETCH_START' })
      const identity = await ipfs.id()
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { identity, timestamp: Date.now() }
      })
    } catch (error) {
      console.error('Failed to fetch identity:', error)
      dispatch({ type: 'FETCH_ERROR' })
    }
  }, [ipfs, ipfsConnected])

  useEffect(() => {
    if (ipfsConnected && !state.isLoading) {
      if (!state.identity || !state.lastSuccess) {
        fetchIdentity()
      }
    }
  }, [ipfsConnected, fetchIdentity, state.isLoading, state.identity, state.lastSuccess])

  useEffect(() => {
    if (!shouldPoll || !ipfsConnected || !state.lastSuccess) return () => {}

    const REFRESH_INTERVAL = 5000
    const timeSinceLastSuccess = Date.now() - state.lastSuccess

    if (timeSinceLastSuccess < REFRESH_INTERVAL) {
      const timeout = setTimeout(fetchIdentity, REFRESH_INTERVAL - timeSinceLastSuccess)
      return () => clearTimeout(timeout)
    } else {
      fetchIdentity()
    }
    return () => {}
  }, [shouldPoll, ipfsConnected, state.lastSuccess, fetchIdentity])

  const agentVersionObject = useMemo(() => {
    if (identityStable?.agentVersion == null) return null
    return parseAgentVersion(identityStable.agentVersion)
  }, [identityStable])

  const contextValue: IdentityContextValue = useMemo(() => ({
    identity: identityStable,
    isLoading: isInitialLoading,
    isRefreshing,
    hasError: state.hasError,
    lastSuccess: state.lastSuccess,
    refetch: fetchIdentity,
    agentVersionObject
  }), [identityStable, isInitialLoading, isRefreshing, state.hasError, state.lastSuccess, fetchIdentity, agentVersionObject])

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
