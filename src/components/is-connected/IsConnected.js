import React from 'react'
import { withTranslation } from 'react-i18next'
import Box from '../box/Box.js'
import GlyphTick from '../../icons/GlyphTick.js'

export const IsConnected = ({ t }) => {
  return (
    <Box className='pv3 ph4'>
      <div>
        <div className='flex flex-wrap items-center'>
          <GlyphTick style={{ height: 76 }} className='fill-green' role='presentation' />
          <h1 className='montserrat fw4 charcoal ma0 f3 green'>{t('app:status.connectedToIpfs')}</h1>
        </div>
        <p className='fw6 mt1 ml3-ns w-100'>{t('connected.paragraph1')}</p>
      </div>
    </Box>
  )
}

export default withTranslation('welcome')(IsConnected)
