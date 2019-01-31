import React from 'react'
import Checkbox from '../checkbox/Checkbox'
import Details from '../details/Details'

const AnalyticsToggle = ({ doToggleAnalytics, analyticsEnabled, t }) => {
  // Simplify fetching a list of i18n keys.
  const items = Array(9).fill(1)
  return (
    <React.Fragment>
      <Checkbox className='dib bg-white pa3' onChange={doToggleAnalytics} checked={analyticsEnabled} label={
        <span className='fw5 f6'>
          {t('AnalyticsToggle.label')}
        </span>
      } />
      <div className='f6 charcoal lh-copy mw7'>
        <Details summaryText={t('AnalyticsToggle.summary')} className='pt3'>
          <p>{t('AnalyticsToggle.paragraph1')}</p>
          <p>{t('AnalyticsToggle.paragraph2')}</p>
          <ul>
            { items.map((_, i) => (
              <li key={i}>
                {t(`AnalyticsToggle.item${i}`)}
              </li>
            ))}
          </ul>
          <p>{t(`AnalyticsToggle.paragraph3`)}</p>
        </Details>
      </div>
    </React.Fragment>
  )
}

export default AnalyticsToggle
