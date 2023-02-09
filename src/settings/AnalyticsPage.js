import React from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import Title from './Title.js'
import Box from '../components/box/Box.js'
import AnalyticsToggle from '../components/analytics-toggle/AnalyticsToggle.js'

export const AnalyticsPage = ({ t }) => (
  <div data-id='AnalyticsPage' className='mw9 center'>
    <Helmet>
      <title>{t('title')} | IPFS</title>
    </Helmet>

    <Box>
      <Title>{t('analytics')}</Title>
      <AnalyticsToggle t={t} open />
    </Box>
  </div>
)

export default withTranslation('settings')(AnalyticsPage)
