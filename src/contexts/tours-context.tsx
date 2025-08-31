import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useBridgeContext } from '../helpers/context-bridge'
// Replace window-or-global with direct window check
const root = typeof window !== 'undefined' ? window : global

interface ToursState {
  enabled: boolean
  tooltip: boolean
}

interface ToursContextValue {
  enabled: boolean
  tooltip: boolean
  enableTours: () => void
  disableTours: () => void
  disableTooltip: () => void
}

const ToursContext = createContext<ToursContextValue | undefined>(undefined)

type ToursAction = | { type: 'TOURS_ENABLE' }
  | { type: 'TOURS_DISABLE' }
  | { type: 'TOURS_TOOLTIP_DISABLE' }

const toursReducer = (state: ToursState, action: ToursAction): ToursState => {
  switch (action.type) {
    case 'TOURS_ENABLE':
      return { ...state, enabled: true }
    case 'TOURS_DISABLE':
      return { ...state, enabled: false }
    case 'TOURS_TOOLTIP_DISABLE':
      return { ...state, tooltip: false }
    default:
      return state
  }
}

const initialState: ToursState = { enabled: false, tooltip: true }

export const ToursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toursReducer, initialState)

  // Initialize from localStorage (equivalent to bundle's init function)
  useEffect(() => {
    const tourTooltip = root.localStorage.getItem('tourTooltip')
    if (tourTooltip) {
      dispatch({ type: 'TOURS_TOOLTIP_DISABLE' })
    }
  }, [])

  const enableTours = useCallback(() => {
    dispatch({ type: 'TOURS_ENABLE' })
  }, [])

  const disableTours = useCallback(() => {
    dispatch({ type: 'TOURS_DISABLE' })
  }, [])

  const disableTooltip = useCallback(() => {
    root.localStorage.setItem('tourTooltip', 'false')
    dispatch({ type: 'TOURS_TOOLTIP_DISABLE' })
  }, [])

  const contextValue: ToursContextValue = {
    enabled: state.enabled,
    tooltip: state.tooltip,
    enableTours,
    disableTours,
    disableTooltip
  }

  // Bridge to redux bundles that might still need tour state
  useBridgeContext('tours', {
    enabled: state.enabled,
    tooltip: state.tooltip,
    doEnableTours: enableTours,
    doDisableTours: disableTours,
    doDisableTooltip: disableTooltip
  })

  return (
    <ToursContext.Provider value={contextValue}>
      {children}
    </ToursContext.Provider>
  )
}

export const useTours = (): ToursContextValue => {
  const context = useContext(ToursContext)
  if (!context) {
    throw new Error('useTours must be used within ToursProvider')
  }
  return context
}
