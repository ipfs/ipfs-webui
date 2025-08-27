import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LogsScreen from './logs-screen/logs-screen.js'
import { LogsProvider } from '../contexts/logs/index'
import { IdentityProvider } from '../contexts/identity-context'

interface DiagnosticsContentProps {
}

type TabKey = 'logs'

const DiagnosticsContent: React.FC<DiagnosticsContentProps> = () => {
  const { t } = useTranslation('diagnostics')
  const [activeTab, setActiveTab] = useState<TabKey>('logs')

  const renderTabButton = (tabKey: TabKey, label: string) => (
    <button
      key={tabKey}
      className={`pa3 mr2 bg-transparent bn pointer fw6 ${
        activeTab === tabKey
          ? 'charcoal bb bw2 b--blue'
          : 'charcoal-muted hover-charcoal'
      }`}
      onClick={() => setActiveTab(tabKey)}
    >
      {label}
    </button>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'logs':
        return (
          <LogsProvider>
            <IdentityProvider>
              <LogsScreen />
            </IdentityProvider>
          </LogsProvider>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <h1 className='montserrat fw4 charcoal ma0 f3 mb3'>{t('title')}</h1>
      <p className='charcoal-muted mb4'>{t('description')}</p>

      {/* Tab Navigation */}
      <div className='bb b--black-20 mb4'>
        <nav className='flex'>
          {renderTabButton('logs', t('tabs.logs'))}
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
