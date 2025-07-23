import React, { useEffect } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box.js'
import { Definition, DefinitionList } from '../components/definition/Definition.js'
import VersionLink from '../components/version-link/VersionLink.js'

interface Identity {
  id: string
  agentVersion: string
  addresses?: string[]
}

interface DiagnosticsContentProps extends WithTranslation {
  identity: Identity | null
  doFetchIdentity: () => void
}

const DiagnosticsContent: React.FC<DiagnosticsContentProps> = ({ t, identity, doFetchIdentity }) => {
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

  return (
    <div>
      <h1 className='montserrat fw4 charcoal ma0 f3 mb3'>{t('title')}</h1>
      <p className='charcoal-muted mb4'>{t('description')}</p>

      {/* Node Information */}
      <Box className='mb3' style={{}}>
        <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('nodeInfo.title')}</h2>
        <DefinitionList>
          <Definition term={t('nodeInfo.peerId')} desc={getField(identity, 'id').toString()} />
          <Definition term={t('nodeInfo.agent')} desc={<VersionLink agentVersion={getField(identity, 'agentVersion')} />} />
          <Definition term={t('nodeInfo.ui')} desc={process.env.REACT_APP_GIT_REV || ''} />
        </DefinitionList>
      </Box>

      {/* System Information */}
      <Box className='mb3' style={{}}>
        <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('systemInfo.title')}</h2>
        <DefinitionList>
          <Definition term={t('systemInfo.platform')} desc={navigator.platform} />
          <Definition term={t('systemInfo.userAgent')} desc={navigator.userAgent} />
          <Definition term={t('systemInfo.language')} desc={navigator.language} />
          <Definition term={t('systemInfo.online')} desc={navigator.onLine ? t('systemInfo.online') : t('systemInfo.offline')} />
        </DefinitionList>
      </Box>

      {/* Connection Status */}
      <Box className='mb3' style={{}}>
        <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('connection.title')}</h2>
        <DefinitionList>
          <Definition term={t('connection.status')} desc={t('connection.connected')} />
          <Definition term={t('connection.addresses')} desc={getField(identity, 'addresses', (addrs: string[]) => addrs?.join(', ') || '')} />
        </DefinitionList>
      </Box>

      {/* Repository Information */}
      <Box className='mb3' style={{}}>
        <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('repo.title')}</h2>
        <DefinitionList>
          <Definition term={t('repo.path')} desc={t('repo.defaultPath')} />
          <Definition term={t('repo.version')} desc={t('repo.defaultVersion')} />
        </DefinitionList>
      </Box>
    </div>
  )
}

export default connect(
  'selectIdentity',
  'doFetchIdentity',
  withTranslation('diagnostics')(DiagnosticsContent)
)
