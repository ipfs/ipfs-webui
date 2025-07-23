/**
 * @see {@link ./REDUX-BUNDLER-MIGRATION-GUIDE.md} for more information
 */
import React, { createContext, useContext, useMemo, ReactNode } from 'react'
// @ts-expect-error - redux-bundler-react is not typed
import { connect } from 'redux-bundler-react'

/**
 * Configuration for creating a connected context provider
 */
export interface ConnectedContextConfig<T> {
  /** The name of the context (for debugging) */
  name: string
  /**
   * Function that takes redux selectors and returns the context value
   * @param selectors - Object containing all the connected selectors/actions
   * @returns The value to provide in the context
   */
  selector: (selectors: any) => T
  /**
   * Array of selector/action names to connect to redux-bundler
   * e.g., ['selectIdentity', 'selectIdentityIsLoading', 'doFetchIdentity']
   */
  reduxSelectors: string[]
  /** Optional default value for the context */
  defaultValue?: T
}

/**
 * Result of creating a connected context
 */
export interface ConnectedContextResult<T> {
  /** The React context */
  Context: React.Context<T | undefined>
  /** The connected provider component */
  Provider: React.ComponentType<{ children: ReactNode }>
  /** Hook to consume the context */
  useContext: () => T
}

/**
 * Creates a React context with a provider that is connected to redux-bundler selectors.
 * This enables gradual migration from redux-bundler to React context while maintaining
 * access to other redux state.
 *
 * See {@link ./REDUX-BUNDLER-MIGRATION-GUIDE.md} for more information
 *
 * @param config - Configuration for the connected context
 * @returns Object containing the Context, Provider, and useContext hook
 *
 * @example
 * ```tsx
 * // Create a connected identity context
 * const { Provider: IdentityProvider, useContext: useIdentity } = createConnectedContextProvider({
 *   name: 'Identity',
 *   selector: ({ identity, identityIsLoading, doFetchIdentity }) => ({
 *     identity,
 *     isLoading: identityIsLoading,
 *     refetch: doFetchIdentity
 *   }),
 *   reduxSelectors: ['selectIdentity', 'selectIdentityIsLoading', 'doFetchIdentity']
 * })
 *
 * // Use in components
 * function MyComponent() {
 *   const { identity, isLoading, refetch } = useIdentity()
 *   // ...
 * }
 * ```
 */
export function createConnectedContextProvider<T> (
  config: ConnectedContextConfig<T>
): ConnectedContextResult<T> {
  const { name, selector, reduxSelectors, defaultValue } = config

  // Create the React context
  const Context = createContext<T | undefined>(defaultValue)
  Context.displayName = `${name}Context`

  // Create the provider component that connects to redux
  const ConnectedProvider = connect(
    ...reduxSelectors,
    (props: any) => {
      const { children, ...reduxProps } = props

      // Use the selector function to transform redux state into context value
      const contextValue = useMemo(() => {
        return selector(reduxProps)
      }, [reduxProps])

      return (
        <Context.Provider value={contextValue}>
          {children}
        </Context.Provider>
      )
    }
  )

  // Create the hook to consume the context
  const useContextHook = (): T => {
    const context = useContext(Context)
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`)
    }
    return context
  }

  return {
    Context,
    Provider: ConnectedProvider as unknown as React.FC<{ children: ReactNode }>,
    useContext: useContextHook
  }
}
