# Migration Guide: Redux-Bundler to React Context

This guide shows how to completely replace redux-bundler bundles with React context while maintaining compatibility with existing dependent bundles.

## Overview

The migration approach has two main strategies:

1. **React Components**: Migrate directly to use context hooks
2. **Redux Bundles**: Use the context bridge to access context values

## Step 1: Set Up the Context Bridge

First, add the context bridge to your app root and ensure redux bundles bridge their values:

```tsx
// src/index.js
import { ContextBridgeProvider } from './helpers/context-bridge.jsx'

function App() {
  return (
    <Provider store={store}>
      <ContextBridgeProvider>
        {/* Your app - contexts added per page as needed */}
      </ContextBridgeProvider>
    </Provider>
  )
}
```

**Update redux bundles to bridge their values:**

```js
// src/bundles/ipfs-provider.js
import { contextBridge } from '../helpers/context-bridge.jsx'
import { createSelector } from 'redux-bundler'

const bundle = {
  // ... existing bundle code

  // Bridge ipfs instance to context bridge
  reactIpfsToBridge: createSelector(
    'selectIpfs',
    (ipfsInstance) => {
      contextBridge.setContext('selectIpfs', ipfsInstance)
    }
  ),

  // Bridge connection status to context bridge
  reactIpfsConnectedToBridge: createSelector(
    'selectIpfsConnected',
    (ipfsConnected) => {
      contextBridge.setContext('selectIpfsConnected', ipfsConnected)
    }
  ),

  // Bridge action creators to context bridge
  init: (store) => {
    contextBridge.setContext('doUpdateIpfsApiAddress', store.doUpdateIpfsApiAddress)
  }
}
```

## Step 2: Bridge Action Creators (do* Actions)

When React contexts need to dispatch actions that are still managed by redux-bundler bundles, you must bridge the action creators in the bundle's `init` function. **You cannot simply create a new `useSelector` for action creators** - they need to be explicitly bound.

### Bridging Action Creators

```js
// src/bundles/ipfs-provider.js
import { contextBridge } from '../helpers/context-bridge.jsx'

const bundle = {
  // ... existing bundle code

  // Bridge action creators to context bridge
  init: (store) => {
    contextBridge.setContext('doUpdateIpfsApiAddress', store.doUpdateIpfsApiAddress)
    contextBridge.setContext('doDismissIpfsInvalidAddress', store.doDismissIpfsInvalidAddress)
    // Add other do* actions as needed
  }
}
```

### Using Bridged Action Creators in React Contexts

```tsx
// src/contexts/some-context.tsx
const SomeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(someReducer, initialState)

  // ✅ Get action creators from redux-bundler via bridge
  const updateIpfsApiAddress = useBridgeSelector<Function>('doUpdateIpfsApiAddress')
  const dismissIpfsInvalidAddress = useBridgeSelector<Function>('doDismissIpfsInvalidAddress')

  const handleApiAddressUpdate = useCallback(async (newAddress: string) => {
    if (updateIpfsApiAddress) {
      await updateIpfsApiAddress(newAddress)
    }
  }, [updateIpfsApiAddress])

  const handleDismissInvalidAddress = useCallback(() => {
    if (dismissIpfsInvalidAddress) {
      dismissIpfsInvalidAddress()
    }
  }, [dismissIpfsInvalidAddress])

  // ... rest of context logic
}
```

**⚠️ Important**: Action creators must be bridged in the bundle's `init` function. You cannot create a new `useSelector` or `react*` selector for action creators - they need to be explicitly bound to the context bridge.

## Step 3: Create Self-Contained Context

### Before (Redux Bundle)
```js
// src/bundles/identity.js
const bundle = createAsyncResourceBundle({
  name: 'identity',
  getPromise: ({ getIpfs }) => getIpfs().id(),
  // ...
})
```

### After (React Context)
```tsx
// src/contexts/identity-context.tsx - Current implementation
const IdentityProviderImpl: React.FC<IdentityProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(identityReducer, initialState)

  // ✅ Get values from redux bundles via bridge (redux bundles are still source of truth)
  const ipfsConnected = useBridgeSelector<boolean>('selectIpfsConnected') || false
  const ipfs = useBridgeSelector<any>('selectIpfs')
  const shouldPoll = useBridgeSelector<boolean>('selectIsNodeInfoOpen') || false

  // ✅ React context is now source of truth for identity data
  const fetchIdentity = useCallback(async () => {
    if (!ipfsConnected || !ipfs) return
    const identity = await ipfs.id()
    dispatch({ type: 'FETCH_SUCCESS', payload: { identity, timestamp: Date.now() } })
  }, [ipfs, ipfsConnected])

  // Auto-fetch and polling logic
  useEffect(() => { /* fetch logic */ }, [ipfsConnected, fetchIdentity])
  useEffect(() => { /* polling logic */ }, [shouldPoll, ipfsConnected, fetchIdentity])

  const contextValue = { identity: state.identity, isLoading: state.isLoading, hasError: state.hasError, refetch: fetchIdentity }

  // ✅ Expose to redux bundles that still need identity data
  useBridgeContext('identity', contextValue)

  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  )
}
```

**📍 Current State**: Identity context is the source of truth for identity data, but consumes IPFS/connection data from redux bundles that haven't been migrated yet.

## Step 4: Update Dependent Bundles

### Before (Using Redux Selector)
```js
// src/bundles/peer-locations.js
bundle.selectPeerLocationsForSwarm = createSelector(
  'selectPeers',
  'selectPeerLocations',
  'selectBootstrapPeers',
  'selectIdentity', // ❌ Redux selector
  (peers, locations, bootstrapPeers, identity) => {
    // Use identity.addresses...
  }
)
```

### After (Using Context Bridge)
```js
// src/bundles/peer-locations.js
import { createContextSelector } from '../helpers/context-bridge.jsx'

const selectIdentityFromContext = createContextSelector('identity')

const selectIdentityData = () => {
  const identityContext = selectIdentityFromContext()
  return identityContext?.identity
}

bundle.selectPeerLocationsForSwarm = createSelector(
  'selectPeers',
  'selectPeerLocations',
  'selectBootstrapPeers',
  selectIdentityData, // ✅ Context bridge
  (peers, locations, bootstrapPeers, identity) => {
    // Same usage as before
  }
)
```

## Step 5: Update React Components

### Before (Redux Connect)
```js
// src/status/NodeInfo.js
const NodeInfo = ({ identity, t }) => {
  return <div>{identity?.id}</div>
}

export default connect('selectIdentity', NodeInfo)
```

### After (React Hooks)
```tsx
// src/status/NodeInfo.tsx
const NodeInfo = ({ t }) => {
  const { identity, isLoading, hasError, refetch } = useIdentity()

  if (isLoading) return <div>Loading...</div>
  if (hasError) return <button onClick={refetch}>Retry</button>

  return <div>{identity?.id}</div>
}

export default NodeInfo // No connect needed!
```

## Step 6: Remove Original Bundle

Once all dependencies are migrated:

1. Remove the original bundle from `src/bundles/index.js`
2. Remove the bundle file entirely
3. Remove any remaining imports

```js
// src/bundles/index.js
export default composeBundles(
  // ...other bundles
  // identityBundle, ❌ Remove this line
  // ...other bundles
)
```

## Step 7: Final Migration to Pure React Contexts

Once all `connect()` usage is removed and everything uses `useBridgeSelector`, you can start migrating to pure React contexts that use hooks directly instead of the bridge.

### Phase 1: Mixed Context Dependencies

Some contexts may depend on others, and while bundles still exist, we still need to use the bridge to expose those context values to bundles. Use direct hooks between contexts, and use the bridge to expose those context values to bundles:

```tsx
// src/contexts/identity-context.tsx - Mixed: some dependencies migrated, some not
const IdentityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(identityReducer, initialState)

  // ✅ These contexts are migrated - use direct hooks
  const { ipfs, isConnected } = useIpfs() // Direct hook (IPFS context is source of truth)
  const { isNodeInfoOpen } = useConnected() // Direct hook (Connected context is source of truth)

  // ❌ Don't use bridge to consume - use direct hooks instead
  // const ipfs = useBridgeSelector<any>('selectIpfs') // Old way

  const fetchIdentity = useCallback(async () => {
    if (!isConnected || !ipfs) return
    const identity = await ipfs.id()
    dispatch({ type: 'FETCH_SUCCESS', payload: { identity, timestamp: Date.now() } })
  }, [ipfs, isConnected])

  // Auto-fetch and polling logic
  useEffect(() => { /* fetch logic */ }, [isConnected, fetchIdentity])
  useEffect(() => { /* polling logic */ }, [isNodeInfoOpen, isConnected, fetchIdentity])

  const contextValue = { identity: state.identity, isLoading: state.isLoading, hasError: state.hasError, refetch: fetchIdentity }

  // ✅ Still expose to redux bundles that haven't migrated yet
  useBridgeContext('identity', contextValue)

  return <IdentityContext.Provider value={contextValue}>{children}</IdentityContext.Provider>
}
```

### Phase 2: Context-to-Context Communication

Direct context dependencies instead of bridge:

```tsx
// src/contexts/peer-locations-context.tsx
const PeerLocationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState({})

  // ✅ All dependencies are React contexts - use direct hooks
  const { peers } = usePeers() // Direct hook (Peers context is source of truth)
  const { identity } = useIdentity() // Direct hook (Identity context is source of truth)

  // ❌ Don't use bridge selectors when React contexts are source of truth
  // const identity = createContextSelector('identity')() // Old way

  const updateLocations = useCallback(async () => {
    // Use identity.addresses directly from React context
    const newLocations = await fetchLocationsForPeers(peers, identity?.addresses)
    setLocations(newLocations)
  }, [peers, identity?.addresses])

  const contextValue = { locations, updateLocations }

  // ✅ Still expose to any remaining redux bundles that need peer location data
  useBridgeContext('peerLocations', contextValue)

  return <PeerLocationsContext.Provider value={contextValue}>{children}</PeerLocationsContext.Provider>
}
```

### Phase 3: Remove Bridge Entirely

Once all bundles are migrated to contexts, remove bridge usage:

```tsx
// src/contexts/identity-context.tsx - Pure React, no bridge
const IdentityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(identityReducer, initialState)

  // Pure React context dependencies
  const { ipfs, isConnected } = useIpfs()
  const { isNodeInfoOpen } = useConnected()

  // Same logic as before...

  const contextValue = { identity: state.identity, isLoading: state.isLoading, hasError: state.hasError, refetch: fetchIdentity }

  // No more bridge needed! 🎉
  return <IdentityContext.Provider value={contextValue}>{children}</IdentityContext.Provider>
}
```

### Component Usage - Same Throughout

React components use the same hooks regardless of implementation:

```tsx
// Always the same - bridge or no bridge
const NodeInfo = () => {
  const { identity, isLoading, hasError, refetch } = useIdentity()
  const { locations } = usePeerLocations()

  // Component logic stays identical
}
```

## Migration Checklist

### Phase 1: Bridge-Based Migration (Per Bundle)

- [ ] **Step 1**: Ensure redux bundles bridge their values with `contextBridge.setContext`
- [ ] **Step 2**: Bridge action creators (do* actions) in bundle's `init` function if needed
- [ ] **Step 3**: Create self-contained context using `useBridgeSelector` for redux dependencies
- [ ] **Step 4**: Add bridge registration with `useBridgeContext()` to expose context to bundles
- [ ] **Step 5**: Identify all dependent bundles and update them to use `createContextSelector()`
- [ ] **Step 6**: Update React components to use context hooks instead of `connect()`
- [ ] **Step 7**: Test that all functionality works (initial load, updates, polling)
- [ ] **Step 8**: Remove original bundle from bundle composition
- [ ] **Step 9**: Delete original bundle file

### Phase 2: Pure React Context Migration

Once all bundles are migrated and no `connect()` usage remains:

- [ ] **Step 10**: Migrate contexts to use direct hooks instead of `useBridgeSelector`
- [ ] **Step 11**: Implement context-to-context communication with direct hooks
- [ ] **Step 12**: Keep `useBridgeContext()` for any remaining redux bundles
- [ ] **Step 13**: Test all inter-context dependencies work correctly

### Phase 3: Remove Bridge System (Final)

When all redux bundles are migrated to contexts:

- [ ] **Step 14**: Remove all `useBridgeContext()` calls from contexts
- [ ] **Step 15**: Remove `ContextBridgeProvider` from app root
- [ ] **Step 16**: Delete bridge system files (`context-bridge.tsx`, etc.)
- [ ] **Step 17**: Clean up any remaining bridge imports
- [ ] **Step 18**: Final testing - pure React context architecture! 🎉

### Key Patterns:

**React Context Pattern:**
```tsx
// ✅ Consume redux-bundler values (redux is source of truth)
const ipfsConnected = useBridgeSelector<boolean>('selectIpfsConnected')
const someReduxValue = useBridgeSelector<T>('selectSomeValue')

// ✅ Expose context values to redux bundles (React is source of truth)
useBridgeContext('myContext', contextValue)

// ✅ Use direct hooks when both are React contexts
const { otherData } = useOtherContext()
```

**Redux Bundle Pattern:**
```js
// ✅ Expose redux values to React contexts (redux is source of truth)
reactSomethingToBridge: createSelector(
  'selectSomething',
  (value) => contextBridge.setContext('selectSomething', value)
)

// ✅ Consume React context values (React is source of truth)
const selectContextData = createContextSelector('myContext')
```

**🎯 Bridge Direction Rules:**
- **Redux → React**: Use `contextBridge.setContext()` in redux reactors
- **Redux Action Creators → React**: Use `contextBridge.setContext()` in bundle's `init` function
- **React → Redux**: Use `useBridgeContext()` in React providers
- **React → React**: Use direct hooks (no bridge needed)

### Bundle Dependencies Map

Use this to track what needs updating:

```
identity bundle
├── bundles/
│   ├── peer-locations.js (uses selectIdentity)
│   └── other-bundle.js
├── components/
│   ├── status/NodeInfo.js (uses selectIdentity)
│   ├── status/NodeInfoAdvanced.js (uses selectIdentity)
│   └── status/StatusPage.js (uses doFetchIdentity)
```

## Key Hooks and Bridge Functions

### `useBridgeSelector<T>(contextName: string): T | undefined`
**Use in React contexts** to reactively access redux-bundler values **when redux-bundler is the source of truth**:

```tsx
const IdentityProvider = ({ children }) => {
  // ✅ Redux-bundler bundles are still the source of truth for these values
  const ipfsConnected = useBridgeSelector<boolean>('selectIpfsConnected') || false
  const ipfs = useBridgeSelector<any>('selectIpfs')
  const shouldPoll = useBridgeSelector<boolean>('selectIsNodeInfoOpen') || false

  // Use these redux values in your React context logic...
}
```

**⚠️ Only use when:** Redux-bundler bundle is the source of truth and hasn't been migrated yet.

### `useBridgeContext(contextName: string, value: T): void`
**Use in React contexts** to expose context values to redux bundles **when React context is the source of truth**:

```tsx
const IdentityProvider = ({ children }) => {
  // ✅ React context is the source of truth for identity data
  const contextValue = { identity, isLoading, hasError, refetch }

  // Expose to redux bundles that haven't been migrated yet
  useBridgeContext('identity', contextValue)

  return <IdentityContext.Provider value={contextValue}>{children}</IdentityContext.Provider>
}
```

**⚠️ Only use when:** React context is the source of truth and redux bundles still need access to the context value.

### `createContextSelector(contextName: string)`
**Use in redux bundles** to access context values:

```js
// src/bundles/peer-locations.js
import { createContextSelector } from '../helpers/context-bridge.jsx'

const selectIdentityFromContext = createContextSelector('identity')

const selectIdentityData = () => {
  const identityContext = selectIdentityFromContext()
  return identityContext?.identity // Access specific properties
}
```

### `contextBridge.setContext(contextName: string, value: T)`
**Use in redux bundle reactors** to expose redux values to React contexts **when redux-bundler is the source of truth**:

```js
// src/bundles/ipfs-provider.js
import { contextBridge } from '../helpers/context-bridge.jsx'

const bundle = {
  // ✅ Redux bundle is the source of truth for IPFS instance
  reactIpfsToBridge: createSelector(
    'selectIpfs',
    (ipfsInstance) => {
      contextBridge.setContext('selectIpfs', ipfsInstance)
    }
  )
}
```

**⚠️ Only use when:** Redux bundle is the source of truth and React contexts need access.

### Bridging Action Creators (do* Actions)

**Use in redux bundle `init` function** to expose action creators to React contexts:

```js
// src/bundles/ipfs-provider.js
const bundle = {
  // ... existing bundle code

  // ✅ Bridge action creators in init function
  init: (store) => {
    contextBridge.setContext('doUpdateIpfsApiAddress', store.doUpdateIpfsApiAddress)
    contextBridge.setContext('doDismissIpfsInvalidAddress', store.doDismissIpfsInvalidAddress)
  }
}
```

**⚠️ Important**: Action creators must be bridged in the bundle's `init` function. You cannot create a new `useSelector` or `react*` selector for action creators - they need to be explicitly bound to the context bridge.

**Use in React contexts** to access bridged action creators:

```tsx
// src/contexts/some-context.tsx
const SomeProvider = ({ children }) => {
  // ✅ Get action creators from redux-bundler via bridge
  const updateIpfsApiAddress = useBridgeSelector<Function>('doUpdateIpfsApiAddress')

  const handleUpdate = useCallback(async (address: string) => {
    if (updateIpfsApiAddress) {
      await updateIpfsApiAddress(address)
    }
  }, [updateIpfsApiAddress])

  // ... rest of context logic
}
```

## Benefits After Migration

✅ **Modern React patterns** - hooks instead of redux-bundler HOCs
✅ **Better TypeScript support** - full type safety
✅ **Easier testing** - mock context instead of redux store
✅ **Simpler state management** - no redux boilerplate
✅ **Performance optimizations** - targeted re-renders
✅ **Reduced bundle size** - remove redux-bundler dependencies

## Migration Pattern for Other Bundles

This same pattern works for any redux-bundler bundle:

1. **Files Bundle** → `FilesProvider` + `useFiles()`
2. **Config Bundle** → `ConfigProvider` + `useConfig()`
3. **Peers Bundle** → `PeersProvider` + `usePeers()`

Each context can still access IPFS and other redux state during the transition, making migration safe and gradual.

## Troubleshooting

**Context value is undefined in bundles**
- Check that the context provider is above the redux Provider
- Verify `useBridgeContext()` is called in the provider

**Bundle selector not updating**
- Redux selectors may need to depend on additional state to trigger updates
- Consider using bundle reactors for context subscriptions

**Performance issues**
- Use `useMemo()` for expensive context value calculations
- Split large contexts into smaller, focused ones
