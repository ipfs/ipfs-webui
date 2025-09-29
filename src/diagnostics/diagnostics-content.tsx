import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import LogsScreen from './logs-screen/logs-screen.js'
import { LogsProvider } from '../contexts/logs/index'
import { IdentityProvider } from '../contexts/identity-context'
import CheckScreen from './check-screen/check-screen.js'
import { useBridgeSelector } from '../helpers/context-bridge'
import { RouteInfo } from '../bundles/routes-types'

interface DiagnosticsContentProps {
}

type TabKey = 'logs' | 'retrieval-check'

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
    className={`pv2 ph3 mr2 br2 pointer fw5 no-underline transition-all ${
      active
        ? 'bg-teal white'
        : 'bg-transparent charcoal-muted hover-bg-gray-muted hover-charcoal'
    }`}
    style={{
      transition: 'all 0.2s ease',
      ...(active && {
        backgroundColor: '#378085',
        color: 'white'
      })
    }}
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
      default:
        return null
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className='mb4 pb2' style={{ borderBottom: '1px solid #e1e5eb' }}>
        <nav className='flex items-center'>
          <TabButton tabKey='logs' label={t('tabs.logs')} active={activeTab === 'logs'} />
          <TabButton tabKey='retrieval-check' label={t('tabs.retrieval-check')} active={activeTab === 'retrieval-check'} />
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
