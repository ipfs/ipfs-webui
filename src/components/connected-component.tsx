import React from 'react'
// @ts-expect-error - no types for redux-bundler-react
import { connect } from 'redux-bundler-react'

// Type for the connect HOC result - omits the props that redux-bundler will provide
type ConnectedComponent<TComponent, TReduxProps> = React.ComponentType<Omit<TComponent, keyof TReduxProps>>

// Helper function to create properly typed connected components
// Users must explicitly specify the props that will be provided by the connect HOC
export function createConnectedComponent<TReduxProps extends object> (
  Component: React.ComponentType<any>,
  ...selectors: string[]
): ConnectedComponent<React.ComponentProps<typeof Component>, TReduxProps> {
  return connect(...selectors, Component) as unknown as ConnectedComponent<React.ComponentProps<typeof Component>, TReduxProps>
}

// Alternative approach using a wrapper component
export function withConnect<TReduxProps extends object> (
  Component: React.ComponentType<any>,
  ...selectors: string[]
): ConnectedComponent<React.ComponentProps<typeof Component>, TReduxProps> {
  const ConnectedComponent = connect(...selectors, Component)
  return ConnectedComponent as unknown as ConnectedComponent<React.ComponentProps<typeof Component>, TReduxProps>
}
