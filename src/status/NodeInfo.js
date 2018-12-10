import React from 'react'
import { translate } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import VersionLink from '../components/version-link/VersionLink'

const Block = ({ children }) => (
  <div className='dt dt--fixed pt2 mw9'>
    { children }
  </div>
)

const Label = ({ children }) => (
  <label className='db pb1 pb0-ns dtc-ns silver tracked ttu f7' style={{ width: '100px' }}>{children}</label>
)

const Value = ({ children, advanced = false }) => (
  <div className={`db dtc-ns charcoal monospace ${advanced ? 'word-wrap f7 lh-copy pa2 bg-white-90' : 'f7 f6-ns'}`}>{children}</div>
)

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
      <div>
        <Block>
          <Label>{t('peerId')}</Label>
          <Value>{this.getField(identity, 'id')}</Value>
        </Block>
        <Block>
          <Label>{t('version')}</Label>
          <Value>
            <VersionLink agentVersion={this.getField(identity, 'agentVersion')} />
          </Value>
        </Block>
      </div>
    )
  }
}

export default connect(
  'selectIdentity',
  translate('status')(NodeInfo)
)
