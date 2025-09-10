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

type TabKey = 'logs' | 'check'

function getTabKeyFromUrl (path: string): TabKey {
  if (path === '/check') {
    return 'check'
  }
  return 'logs'
}

interface TabButtonProps {
  tabKey: TabKey
  label: string
  active: boolean
}

const TabButton = ({ tabKey, label, active }: TabButtonProps) => (
  <a
    key={tabKey}
    href={`#/diagnostics${tabKey === 'logs' ? '' : `/${tabKey}`}`}
    className={`pv2 mr2 bg-transparent bn pointer fw6 no-underline ${
      active ? 'charcoal bb bw2 b--blue' : 'charcoal-muted underline-hover'
    }`}
  >
    {label}
  </a>
)

const DiagnosticsContent: React.FC<DiagnosticsContentProps> = () => {
  const { t } = useTranslation('diagnostics')
  const routeInfo = useBridgeSelector<RouteInfo>('selectRouteInfo')
  const activeTab = getTabKeyFromUrl(routeInfo?.params.path ?? '')

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
      case 'check':
        return (
          <CheckScreen />
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className='bb b--black-20 mb4'>
        <nav className='flex'>
          <TabButton tabKey='logs' label={t('tabs.logs')} active={activeTab === 'logs'} />
          <TabButton tabKey='check' label={t('tabs.check')} active={activeTab === 'check'} />
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
