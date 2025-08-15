import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../box/Box.js'
import Button from '../button/button'
import { useIdentity } from '../../contexts/identity-context'

interface UnsupportedKuboVersionProps {
}
/**
 * TODO: support various features and accept translation keys for each feature instead of hardcoding them only for the logs screen.
 */
const UnsupportedKuboVersion: React.FC<UnsupportedKuboVersionProps> = () => {
  const { t } = useTranslation('diagnostics')
  const { identity } = useIdentity()

  return (
    <Box className='pa4 tc' style={{ width: '100%' }}>
      <div className='mb4'>
        <div className='f1 mb3'>⚠️</div>
        <h3 className='montserrat fw6 charcoal ma0 f4 mb3'>
          {t('logs.unsupported.title')}
        </h3>
        <p className='charcoal-muted f5 lh-copy mb4'>
          {t('logs.unsupported.description', { version: identity?.agentVersion })}
        </p>
        <div className='bg-light-gray pa3 br2 mb4'>
          <p className='charcoal f6 ma0'>
            {t('logs.unsupported.currentVersion')}
          </p>
        </div>
        <div className='mb4'>
          <h4 className='montserrat fw6 charcoal ma0 f5 mb3'>
            {t('logs.unsupported.upgradeTitle')}
          </h4>
          <p className='charcoal-muted f6 lh-copy mb3'>
            {t('logs.unsupported.upgradeDescription')}
          </p>
          <div className='flex justify-center gap3'>
            <Button
              className='bg-blue white'
              onClick={() => window.open('https://ipfs.io/docs/install/', '_blank')}
            >
              {t('logs.unsupported.downloadKubo')}
            </Button>
            <Button
              className='bg-gray white'
              onClick={() => window.open('https://github.com/ipfs/kubo/releases', '_blank')}
            >
              {t('logs.unsupported.viewReleases')}
            </Button>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default UnsupportedKuboVersion
