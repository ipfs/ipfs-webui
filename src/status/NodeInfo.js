import React from 'react'
import { useTranslation } from 'react-i18next'
import { useIdentity } from '../contexts/identity-context.jsx'
import VersionLink from '../components/version-link/VersionLink.js'
import { Definition, DefinitionList } from '../components/definition/Definition.js'

const NodeInfo = () => {
  const { identity, isLoading } = useIdentity()
  const { t } = useTranslation('app')

  const getField = (obj, field, fn) => {
    if (obj && obj[field]) {
      if (fn) {
        return fn(obj[field])
      }

      return obj[field]
    }

    return ''
  }

  if (isLoading) {
    return (
      <DefinitionList>
        <Definition term={t('terms.peerId')} desc={t('loading')} />
        <Definition term={t('terms.agent')} desc={t('loading')} />
        <Definition term={t('terms.ui')} desc={process.env.REACT_APP_GIT_REV} />
      </DefinitionList>
    )
  }

  return (
    <DefinitionList>
      <Definition term={t('terms.peerId')} desc={getField(identity, 'id').toString()} />
      <Definition term={t('terms.agent')} desc={<VersionLink agentVersion={getField(identity, 'agentVersion')} />} />
      <Definition term={t('terms.ui')} desc={process.env.REACT_APP_GIT_REV} />
    </DefinitionList>
  )
}

export default NodeInfo
