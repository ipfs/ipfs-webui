import React from 'react'
import { useTranslation } from 'react-i18next'
import { useIdentity } from '../contexts/identity-context.jsx'
import VersionLink from '../components/version-link/version-link.tsx/index.js.js'
import { Definition, DefinitionList } from '../components/definition/Definition.js'

const NodeInfo = () => {
  const { identity } = useIdentity()
  const { t } = useTranslation('app')

  return (
    <DefinitionList>
      <Definition term={t('terms.peerId')} desc={identity?.id?.toString() ?? t('loading')} />
      <Definition term={t('terms.agent')} desc={<VersionLink agentVersion={identity?.agentVersion ?? t('loading')} />} />
      <Definition term={t('terms.ui')} desc={process.env.REACT_APP_GIT_REV} />
    </DefinitionList>
  )
}

export default NodeInfo
