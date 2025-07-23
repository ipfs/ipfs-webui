import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box.js'
import IsNotConnected from '../components/is-not-connected/IsNotConnected.js'
import DiagnosticsContent from './diagnostics-content.jsx'

interface DiagnosticsPageProps {
  ipfsConnected: boolean
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

export default connect(
  'selectIpfsConnected',
  DiagnosticsPage
)
