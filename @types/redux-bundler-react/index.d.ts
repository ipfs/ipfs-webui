declare module 'redux-bundler-react' {
  import type { ComponentType, ReactNode } from 'react'

  // Overloaded function signatures for connect
  export function connect<ConnectedProps = Record<string, unknown>>(
    ...selectors: string[]
  ): <T extends ComponentType<ConnectedProps>>(component: T) => T

  export function connect<Props = Record<string, unknown>>(
    selectors: string[],
    component: ComponentType<Props>
  ): ComponentType<Props>

  export function connect<Props = Record<string, unknown>>(
    selector: string,
    component: ComponentType<Props>
  ): ComponentType<Props>

  // Handle multiple selectors with a component
  export function connect<Props = Record<string, unknown>>(
    ...args: [...string[], ComponentType<Props>]
  ): ComponentType<Props>

  export class Provider extends ComponentType<{
    store: Record<string, unknown>
    children: ReactNode
  }> {}
}
