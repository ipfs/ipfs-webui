import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createConnectedComponent } from '../components/connected-component.jsx'
import LogsScreen from './logs-screen.jsx'
import ConnectivityScreen from './connectivity-screen.jsx'

interface Identity {
  id: string
  agentVersion: string
  addresses?: string[]
}

interface ReduxBundlerProps {
  identity: Identity | null
  doFetchIdentity: () => void
}

interface DiagnosticsContentProps extends ReduxBundlerProps {
}

type TabKey = 'logs' | 'connectivity'

const DiagnosticsContent: React.FC<DiagnosticsContentProps> = ({ identity, doFetchIdentity }) => {
  const { t } = useTranslation('diagnostics')
  const [activeTab, setActiveTab] = useState<TabKey>('logs')

  useEffect(() => {
    if (identity) {
      doFetchIdentity()
    }
  }, [identity, doFetchIdentity])

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
        return <LogsScreen />
      case 'connectivity':
        return <ConnectivityScreen />
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
          {renderTabButton('connectivity', t('tabs.connectivity'))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default createConnectedComponent<ReduxBundlerProps>(
  DiagnosticsContent,
  'selectIdentity',
  'doFetchIdentity'
)
