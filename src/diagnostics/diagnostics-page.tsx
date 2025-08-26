import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../components/box/Box.js'
import { Helmet } from 'react-helmet'
import IsNotConnected from '../components/is-not-connected/is-not-connected'
import DiagnosticsContent from './diagnostics-content'
import { useBridgeSelector } from '../helpers/context-bridge'

const DiagnosticsPage: React.FC = () => {
  const { t } = useTranslation('diagnostics')
  const ipfsConnected = useBridgeSelector('selectIpfsConnected')

  return (
    <div data-id='DiagnosticsPage' className='mw9 center'>
      <Helmet>
        <title>{t('title')} | IPFS</title>
      </Helmet>
      <Box className='pa3' style={{ minHeight: 0 }}>
        <div className='flex'>
          <div className='flex-auto'>
            { ipfsConnected
              ? <DiagnosticsContent />
              : <IsNotConnected />
            }
          </div>
        </div>
      </Box>
    </div>
  )
}

/**
 * @template {ReduxBundlerProps}
 */
export default DiagnosticsPage
