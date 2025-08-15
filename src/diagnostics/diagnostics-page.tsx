import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../components/box/Box.js'
import { createConnectedComponent } from '../components/connected-component.js'
import Helmet from '../components/helmet-wrapper.jsx'
import IsNotConnected from '../components/is-not-connected/is-not-connected.js'
import DiagnosticsContent from './diagnostics-content.jsx'

interface ReduxBundlerProps {
  ipfsConnected: boolean
}

interface DiagnosticsPageProps extends ReduxBundlerProps {
}

const DiagnosticsPage: React.FC<DiagnosticsPageProps> = ({ ipfsConnected }) => {
  const { t } = useTranslation('diagnostics')

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
export default createConnectedComponent(
  DiagnosticsPage,
  'selectIpfsConnected'
)
