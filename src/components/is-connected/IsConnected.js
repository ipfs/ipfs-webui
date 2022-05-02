import React from 'react'
import { withTranslation } from 'react-i18next'

import IsConnectedIcon from '../../icons/retro/IsConnectedIcon'

export const IsConnected = ({ t }) => {
  return (
    <div>
      <div className='flex flex-wrap items-center'>
        <IsConnectedIcon color="#BDFF69"/>
        <h1 className='spacegrotesk f5 fw4 ma0 ml3' style={{ color: '#BDFF69' }}>{t('app:status.connectedToIpfs')}</h1>
      </div>
      <p className='spacegrotesk f7 fw4 mt2 w-100 purple'>{t('connected.paragraph1')}</p>
    </div>
  )
}

export default withTranslation('welcome')(IsConnected)
