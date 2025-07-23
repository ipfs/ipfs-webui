import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../components/box/Box.js'
import { createConnectedComponent } from '../components/connected-component.jsx'
import { Definition, DefinitionList } from '../components/definition/Definition.js'
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

  const getField = (obj: any, field: string, fn?: (value: any) => string): string => {
    if (obj && obj[field]) {
      if (fn) {
        return fn(obj[field])
      }
      return obj[field]
    }
    return ''
  }

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

      {/* Legacy System Info - collapsed by default */}
      <details className='mt4'>
        <summary className='pointer fw6 charcoal f5 mb3'>System Information</summary>

        <Box className='mb3' style={{}}>
          <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('systemInfo.title')}</h2>
          <DefinitionList>
            <Definition term={t('systemInfo.platform')} desc={navigator.platform} />
            <Definition term={t('systemInfo.userAgent')} desc={navigator.userAgent} />
            <Definition term={t('systemInfo.language')} desc={navigator.language} />
            <Definition term={t('systemInfo.online')} desc={navigator.onLine ? t('systemInfo.online') : t('systemInfo.offline')} />
          </DefinitionList>
        </Box>

        <Box className='mb3' style={{}}>
          <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('connection.title')}</h2>
          <DefinitionList>
            <Definition term={t('connection.status')} desc={t('connection.connected')} />
            <Definition term={t('connection.addresses')} desc={getField(identity, 'addresses', (addrs: string[]) => addrs?.join(', ') || '')} />
          </DefinitionList>
        </Box>

        <Box className='mb3' style={{}}>
          <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('repo.title')}</h2>
          <DefinitionList>
            <Definition term={t('repo.path')} desc={t('repo.defaultPath')} />
            <Definition term={t('repo.version')} desc={t('repo.defaultVersion')} />
          </DefinitionList>
        </Box>
      </details>
    </div>
  )
}

export default createConnectedComponent<ReduxBundlerProps>(
  DiagnosticsContent,
  'selectIdentity',
  'doFetchIdentity'
)
