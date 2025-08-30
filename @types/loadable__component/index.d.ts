declare module '@loadable/component' {
  import React from 'react'

  interface LoadableOptions {
    fallback?: React.ReactNode
    ssr?: boolean
  }

  function Loadable<P = {}>(
    loadFn: () => Promise<{ default: React.ComponentType<P> }>,
    options?: LoadableOptions
  ): React.ComponentType<P>

  export default Loadable
}
