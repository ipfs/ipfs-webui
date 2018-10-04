import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import Address from '../components/address/Address'
import ProviderLink from '../components/provider-link/ProviderLink'
import VersionLink from '../components/version-link/VersionLink'
import Speedometer from './Speedometer'
import { Title } from './Commons'
import 'details-polyfill'

const Block = ({ children }) => (
  <div className='dt dt--fixed pt2 mw9'>
    { children }
  </div>
)

const Label = ({ children }) => (
  <label className='dtc silver tracked ttu f7' style={{ width: '100px' }}>{children}</label>
)

const Value = ({ children, advanced = false }) => (
  <div className={`dtc charcoal monospace ${advanced ? 'word-wrap f7 lh-copy pa2 bg-white-60' : 'truncate'}`}>{children}</div>
)

const Graph = (props) => (
  <div className='mr2 ml2 mt3 mt0-l'>
    <Speedometer {...props} />
  </div>
)

class NodeInfo extends React.Component {
  state = {
    downSpeed: {
      filled: 0,
      total: 125000 // Starts with 1 Mb/s max
    },
    upSpeed: {
      filled: 0,
      total: 125000 // Starts with 1 Mb/s max
    }
  }

  componentDidUpdate (_, prevState) {
    const { stats } = this.props

    const down = stats ? parseInt(stats.bw.rateIn.toFixed(0), 10) : 0
    const up = stats ? parseInt(stats.bw.rateOut.toFixed(0), 10) : 0

    if (down !== prevState.downSpeed.filled || up !== prevState.upSpeed.filled) {
      this.setState({
        downSpeed: {
          filled: down,
          total: Math.max(down, prevState.downSpeed.total)
        },
        upSpeed: {
          filled: up,
          total: Math.max(up, prevState.upSpeed.total)
        }
      })
    }
  }

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
    const { t, identity, ipfsProvider, ipfsApiAddress, peers } = this.props
    const { downSpeed, upSpeed } = this.state

    let addresses = null

    if (identity) {
      addresses = [...new Set(identity.addresses)].sort().map(addr => <Address key={addr} value={addr} />)
    }

    return (
      <div className='f6'>
        <div className='flex flex-column flex-row-l flex-wrap-l justify-between-l'>
          <div className='w-100 w-60-l pr2-l flex-none' >
            <Title>{t('nodeInfo')}</Title>
            <Block>
              <Label>{t('peerId')}</Label>
              <Value>{this.getField(identity, 'id')}</Value>
            </Block>
            <Block>
              <Label>{t('api')}</Label>
              <Value>
                {ipfsProvider === 'js-ipfs-api' && (
                  <Address value={ipfsApiAddress} />
                )}
                {ipfsProvider !== 'js-ipfs-api' && (
                  <ProviderLink name={ipfsProvider} />
                )}
              </Value>
            </Block>
            <Block>
              <Label>{t('version')}</Label>
              <Value>
                <VersionLink agentVersion={this.getField(identity, 'agentVersion')} />
              </Value>
            </Block>
            <Block>
              <Label>{t('peers')}</Label>
              <Value>{peers ? peers.length : 0}</Value>
            </Block>
          </div>
          <div className='dn db-l w-100 w-40-l pl2-l flex-none'>
            <Title>{t('networkTraffic')}</Title>
            <div className='flex-wrap flex-no-wrap-l flex justify-between' style={{ maxWidth: 400 }}>
              <Graph
                title={t('upSpeed')}
                color='#69c4cd'
                {...upSpeed} />
              <Graph
                title={t('downSpeed')}
                color='#f39021'
                {...downSpeed} />
            </div>
          </div>
        </div>

        <details className='mt3'>
          <summary className='pointer blue outline-0'>{t('advanced')}</summary>
          <div className='mt3'>
            <Block>
              <Label>{t('publicKey')}</Label>
              <Value advanced>{this.getField(identity, 'publicKey')}</Value>
            </Block>
            {addresses && addresses.length ? (
              <Block>
                <Label>{t('addresses')}</Label>
                <Value advanced>{addresses}</Value>
              </Block>
            ) : null}
          </div>
        </details>
      </div>
    )
  }
}

export default connect(
  'selectIdentity',
  'selectIpfsProvider',
  'selectIpfsApiAddress',
  'selectPeers',
  'selectStats',
  translate('status')(NodeInfo)
)
