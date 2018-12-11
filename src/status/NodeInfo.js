import React from 'react'
import { translate } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import VersionLink from '../components/version-link/VersionLink'
import { Definition, DefinitionList } from '../components/definition/Definition.js'

class NodeInfo extends React.Component {
  getField (obj, field, fn) {
    if (obj && obj[field]) {
      if (fn) {
        return fn(obj[field])
      }

      return obj[field]
    }

    return ''
  }

  getVersion (identity) {
    const raw = this.getField(identity, 'agentVersion')
    return raw ? raw.split('/').join(' ') : ''
  }

  render () {
    const { t, identity } = this.props

    return (
      <DefinitionList>
        <Definition term={t('peerId')} desc={this.getField(identity, 'id')} />
        <Definition term={t('version')} desc={<VersionLink agentVersion={this.getField(identity, 'agentVersion')} />} />
      </DefinitionList>
    )
  }
}

export default connect(
  'selectIdentity',
  translate('status')(NodeInfo)
)
