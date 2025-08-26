import React, { createContext, useContext, useCallback } from 'react'
import { useBridgeContext } from '../helpers/context-bridge'

interface LocalStorageContextValue {
  readSetting: (id: string) => string | object | null
  writeSetting: (id: string, value: string | number | boolean | object) => void
}

const LocalStorageContext = createContext<LocalStorageContextValue | undefined>(undefined)

export const LocalStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * Reads setting from the `localStorage` with a given `id` as JSON. If JSON
   * parse is failed setting is interpreted as a string value.
   */
  const readSetting = useCallback((id: string): string | object | null => {
    let setting: string | null = null
    if (window.localStorage) {
      try {
        setting = window.localStorage.getItem(id)
      } catch (error) {
        console.error(`Error reading '${id}' value from localStorage`, error)
      }
      try {
        return JSON.parse(setting || '')
      } catch (_) {
        // res was probably a string, so pass it on.
        return setting
      }
    }
    return setting
  }, [])

  /**
   * Writes setting to localStorage as JSON string
   */
  const writeSetting = useCallback((id: string, value: string | number | boolean | object) => {
    try {
      window.localStorage.setItem(id, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing '${id}' value to localStorage`, error)
    }
  }, [])

  const contextValue: LocalStorageContextValue = {
    readSetting,
    writeSetting
  }

  // Bridge to redux bundles that still need localStorage utilities
  useBridgeContext('localStorage', contextValue)

  return (
    <LocalStorageContext.Provider value={contextValue}>
      {children}
    </LocalStorageContext.Provider>
  )
}

export const useLocalStorage = (): LocalStorageContextValue => {
  const context = useContext(LocalStorageContext)
  if (!context) {
    throw new Error('useLocalStorage must be used within LocalStorageProvider')
  }
  return context
}
