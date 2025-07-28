import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createConnectedComponent } from '../components/connected-component.jsx'
import Box from '../components/box/Box.js'
import Button from '../components/button/button.jsx'

const ErrorMessage = ({ error }) => {
  return (
    <div className='pa3 ba b--red bg-washed-red'>
      <p className='red ma0'><strong>Error:</strong> {error}</p>
    </div>
  )
}

const ConnectivityScreen = ({ identity }) => {
  const { t } = useTranslation('diagnostics')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [checkEndpoint, setCheckEndpoint] = useState('https://check.ipfs.network')
  const [useCustomEndpoint, setUseCustomEndpoint] = useState(false)

  const runConnectivityCheck = async () => {
    if (!identity?.id) {
      setResult({ error: 'Node identity not available' })
      return
    }

    setIsChecking(true)
    setResult(null)

    try {
      // Call the check.ipfs.network API or similar service
      const response = await fetch(`${checkEndpoint}/api/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          peerId: identity.id,
          multiaddrs: identity.addresses || []
        })
      })

      if (!response.ok) {
        throw new Error(`Check failed: ${response.statusText}`)
      }

      const data = await response.json()

      setResult({
        nodeId: identity.id,
        addresses: identity.addresses || [],
        reachable: data.reachable || false,
        natStatus: data.natStatus || 'Unknown',
        dhtStatus: data.dhtStatus || 'Unknown',
        lastCheck: new Date().toISOString()
      })
    } catch (error) {
      console.error('Connectivity check failed:', error)
      setResult({
        nodeId: identity.id,
        addresses: identity.addresses || [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusColor = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'green' : 'red'
    }
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'good':
        case 'active':
        case 'connected':
          return 'green'
        case 'bad':
        case 'inactive':
        case 'disconnected':
          return 'red'
        case 'partial':
        case 'limited':
          return 'orange'
        default:
          return 'gray'
      }
    }
    return 'gray'
  }

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  return (
    <div>
      <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('connectivity.title')}</h2>
      <p className='charcoal-muted mb4'>{t('connectivity.description')}</p>

      {/* Check Configuration */}
      <Box className='mb3' style={{}}>
        <h3 className='montserrat fw4 charcoal ma0 f5 mb3'>{t('connectivity.checkIpfs.title')}</h3>
        <p className='charcoal-muted mb3'>{t('connectivity.checkIpfs.description')}</p>

        <div className='mb3'>
          <label className='flex items-center mb2'>
            <input
              type='checkbox'
              className='mr2'
              checked={useCustomEndpoint}
              onChange={(e) => setUseCustomEndpoint(e.target.checked)}
            />
            {t('connectivity.checkIpfs.customEndpoint')}
          </label>

          {useCustomEndpoint && (
            <div className='mb2'>
              <label className='db fw6 mb2'>{t('connectivity.checkIpfs.endpoint')}</label>
              <input
                type='url'
                className='input-reset ba b--black-20 pa2 w-100'
                value={checkEndpoint}
                onChange={(e) => setCheckEndpoint(e.target.value)}
                placeholder='https://check.ipfs.network'
              />
            </div>
          )}
        </div>

        <Button
          className={`${isChecking ? 'bg-gray' : 'bg-blue'} white`}
          onClick={runConnectivityCheck}
          disabled={isChecking || !identity}
        >
          {isChecking ? t('connectivity.checkIpfs.checking') : t('connectivity.checkIpfs.runCheck')}
        </Button>
      </Box>

      {/* Results */}
      {result && (
        <Box className='mb3' style={{}}>
          <h3 className='montserrat fw4 charcoal ma0 f5 mb3'>{t('connectivity.results.title')}</h3>

          {result.error
            ? <ErrorMessage error={result.error} />
            : (
            <div className='grid'>
              {/* Node ID */}
              <div className='mb3'>
                <dt className='fw6 mb1'>{t('connectivity.results.nodeId')}</dt>
                <dd className='ml0 f6 code'>{result.nodeId}</dd>
              </div>

              {/* Addresses */}
              <div className='mb3'>
                <dt className='fw6 mb1'>{t('connectivity.results.addresses')}</dt>
                <dd className='ml0'>
                  {result.addresses && result.addresses.length > 0
                    ? (
                    <ul className='list pl0'>
                      {result.addresses.map((addr, index) => (
                        <li key={index} className='f6 code mb1'>{addr}</li>
                      ))}
                    </ul>
                      )
                    : (
                    <span className='gray'>No addresses available</span>
                      )}
                </dd>
              </div>

              {/* Reachability */}
              <div className='mb3'>
                <dt className='fw6 mb1'>{t('connectivity.results.reachable')}</dt>
                <dd className='ml0'>
                  <span style={{ color: getStatusColor(result.reachable) }}>
                    ● {result.reachable ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>

              {/* NAT Status */}
              <div className='mb3'>
                <dt className='fw6 mb1'>{t('connectivity.results.natStatus')}</dt>
                <dd className='ml0'>
                  <span style={{ color: getStatusColor(result.natStatus) }}>
                    ● {result.natStatus}
                  </span>
                </dd>
              </div>

              {/* DHT Status */}
              <div className='mb3'>
                <dt className='fw6 mb1'>{t('connectivity.results.dhtStatus')}</dt>
                <dd className='ml0'>
                  <span style={{ color: getStatusColor(result.dhtStatus) }}>
                    ● {result.dhtStatus}
                  </span>
                </dd>
              </div>

              {/* Last Check */}
              {result.lastCheck && (
                <div className='mb3'>
                  <dt className='fw6 mb1'>{t('connectivity.results.lastCheck')}</dt>
                  <dd className='ml0 gray f6'>{formatTimestamp(result.lastCheck)}</dd>
                </div>
              )}
            </div>
              )}
        </Box>
      )}

      {/* Embedded Check UI */}
      <Box style={{}}>
        <h3 className='montserrat fw4 charcoal ma0 f5 mb3'>External Connectivity Check</h3>
        <p className='charcoal-muted mb3'>
          You can also use the external connectivity checker directly:
        </p>
        <iframe
          src={`${checkEndpoint}${identity?.id ? `?peerId=${identity.id}` : ''}`}
          width='100%'
          height='500'
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          title='IPFS Connectivity Check'
        />
      </Box>
    </div>
  )
}

export default createConnectedComponent(
  ConnectivityScreen,
  'selectIdentity'
)
