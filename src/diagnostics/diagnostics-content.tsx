import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import LogsScreen from './logs-screen/logs-screen.js'
import { LogsProvider } from '../contexts/logs/index'
import { IdentityProvider } from '../contexts/identity-context'
import CheckScreen from './check-screen/check-screen.js'
import { useBridgeSelector } from '../helpers/context-bridge'
import { RouteInfo } from '../bundles/routes-types'
import { ProvideProvider } from '../contexts/ProvideStat'

interface DiagnosticsContentProps {
}

type TabKey = 'logs' | 'retrieval-check' | 'dht-provide'

function getTabKeyFromUrl (path: string): { tab: TabKey, remainder?: string } {
  const parts = path.split('/').filter(p => p) // Remove empty strings

  if (parts.length === 0) {
    // Default to logs for empty path
    return { tab: 'logs' }
  }

  const tab = parts[0] as TabKey
  const remainder = parts.slice(1).join('/')

  return {
    tab,
    remainder: remainder || undefined
  }
}

interface TabButtonProps {
  tabKey: TabKey
  label: string
  active: boolean
}
const TabButton = ({ tabKey, label, active }: TabButtonProps) => (
  <a
    key={tabKey}
    href={`#/diagnostics/${tabKey}`}
    className={`pv2 ph3 mr2 br2 pointer fw5 no-underline transition-all diagnostics-tab ${
      active
        ? 'diagnostics-tab-active'
        : 'diagnostics-tab-inactive'
    }`}
  >
    {label}
  </a>
)

const DiagnosticsContent: React.FC<DiagnosticsContentProps> = () => {
  const { t } = useTranslation('diagnostics')
  const routeInfo = useBridgeSelector<RouteInfo>('selectRouteInfo')
  const path = routeInfo?.params.path ?? ''
  const { tab: activeTab, remainder } = getTabKeyFromUrl(path)

  // Redirect from /diagnostics or /diagnostics/ to /diagnostics/logs
  useEffect(() => {
    // Check if we're still loading route info
    if (!routeInfo) return

    // Only redirect from true root paths
    const isRootDiagnostics = routeInfo.url === '/diagnostics' || routeInfo.url === '/diagnostics/'
    if (isRootDiagnostics && (path === '' || path === '/')) {
      window.location.replace('#/diagnostics/logs')
    }
  }, [path, routeInfo])

  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'logs':
        return (
          <IdentityProvider>
            <LogsProvider>
              <LogsScreen />
            </LogsProvider>
          </IdentityProvider>
        )
      case 'retrieval-check':
        return (
          <CheckScreen cid={remainder} />
        )
      case 'dht-provide': {
        // Lazy-load the DHT provide screen to keep bundle size small
        const DhtProvideScreen = require('./dht-provide/dht-provide-screen').default
        return (
          <IdentityProvider>
            <ProvideProvider>
              <DhtProvideScreen />
            </ProvideProvider>
          </IdentityProvider>
        )
      }
      default:
        return null
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className='mb4 pb2' style={{ borderBottom: '1px solid var(--theme-border-secondary)' }}>
        <nav className='flex items-center'>
          <TabButton tabKey='logs' label={t('tabs.logs')} active={activeTab === 'logs'} />
          <TabButton tabKey='retrieval-check' label={t('tabs.retrieval-check')} active={activeTab === 'retrieval-check'} />
          <TabButton tabKey='dht-provide' label={t('tabs.dht-provide')} active={activeTab === 'dht-provide'} />
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

/**
 * @template {ReduxBundlerProps}
 */
export default DiagnosticsContent
