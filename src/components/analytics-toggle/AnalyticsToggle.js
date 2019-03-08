import React, { useState } from 'react'
import { Trans } from 'react-i18next'
import Checkbox from '../checkbox/Checkbox'
import Details from '../details/Details'

const ExampleRequest = ({ url, method = 'GET' }) => {
  return (
    <pre className='overflow-x-scroll pa3 mr3 f6 ba b--black-10 br2 bg-snow-muted'>
      <code className='green'>{method}</code> {url}
    </pre>
  )
}

const QueryParams = ({ url }) => {
  if (!url) return null
  const params = (new URL(url)).searchParams
  const entries = [...params]
  return (
    <dl className='pa3 mr3 f7 overflow-x-scroll monospace nowrap ba b--black-10 br2 bg-snow-muted'>
      {entries.map(([key, value]) => (
        <div key={`QueryParams-${key}`}>
          <dt className='dib green'>{key}:</dt>
          <dd className='dib ml1'>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const AnalyticType = ({ children, onChange, enabled, label, summary, exampleRequest, queryParams, sourceLink, sourceLinkLabel = 'view source' }) => {
  // show hide state. update react.
  const [isOpen, setOpen] = useState(false)
  return (
    <section className='bg-white bb b--black-10'>
      <div className='flex items-center'>
        <Checkbox className='pv3 pl3 pr1 bg-white flex-none' onChange={onChange} checked={enabled} label={
          <span className='fw5 f6'>{label}</span>
        } />
        <div className='truncate fw4 f6 flex-auto charcoal-muted'>&ndash; {summary}</div>
        <button className='focus-outline bg-transparent pa3 bn link blue pointer flex-none' onClick={() => setOpen(!isOpen)} style={{ minWidth: 100 }}>
          {isOpen ? 'Close' : 'Show me' }
        </button>
      </div>
      {isOpen && (
        <div className='ph3 nt2 pb3'>
          {children}
          {sourceLink && (
            <p>
              <a href={sourceLink} className='link blue' target='_blank'>View source</a>
            </p>
          )}
          {exampleRequest && (
            <div>
              <h3 className='f5 fw6'>Example request</h3>
              <ExampleRequest url={exampleRequest} />
              <h4 className='f6 fw5'>Query parameters</h4>
              <QueryParams url={exampleRequest} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

const AnalyticsToggle = ({ analyticsActionsToRecord, doToggleAnalytics, analyticsEnabled, t }) => {
  return (
    <React.Fragment>
      <Checkbox className='dib bg-white pa3' onChange={doToggleAnalytics} checked={analyticsEnabled} label={
        <span className='fw5 f6'>
          {t('AnalyticsToggle.label')}
        </span>
      } />
      <div className='f6 charcoal lh-copy mw7'>
        <Details open summaryText={t('AnalyticsToggle.summary')} className='pt3'>
          <p>
            <Trans i18nKey='AnalyticsToggle.paragraph1'>
              Protocol Labs hosts a <a className='link blue' href='https://count.ly/'>Countly</a> instance to record anonymous usage data for this app.
            </Trans>
          </p>
          <p>{t(`AnalyticsToggle.paragraph3`)}</p>
          <p>{t('AnalyticsToggle.optionalInfo')}</p>

          <AnalyticType
            onChange={doToggleAnalytics}
            enabled={analyticsEnabled}
            label={t('AnalyticsToggle.sessions.label')}
            summary={t('AnalyticsToggle.sessions.summary')}
            sourceLink='https://github.com/Countly/countly-sdk-web/blob/93442edbe8c108618c88cc9e1ad179892c42940b/lib/countly.js#L1885-L1953'
            exampleRequest='https://countly.ipfs.io/i?begin_session=1&metrics=%7B%22_app_version%22%3A%222.4.0%22%2C%22_ua%22%3A%22Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_14_2)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F72.0.3626.119%20Safari%2F537.36%22%2C%22_resolution%22%3A%221920x1200%22%2C%22_density%22%3A1%2C%22_locale%22%3A%22en-GB%22%7D&app_key=8fa213e6049bff23b08e5f5fbac89e7c27397612&device_id=17de0839-d9b5-4800-9a3c-e07270e0b17b&sdk_name=javascript_native_web&sdk_version=19.02.1&timestamp=1551799890469&hour=15&dow=2'>
            <p>The following browser metrics are sent</p>
            <ul>
              <li>A random, generated device ID</li>
              <li>Timestamp when the session starts</li>
              <li>Periodic timestamps to track duration</li>
              <li>App version e.g. "2.4.4"</li>
              <li>Locale e.g. "en-GB"</li>
              <li>User Agent e.g. "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) ..."</li>
              <li>Screen resolution e.g. "800x600"</li>
              <li>Screen pixel density e.g. "1"</li>
            </ul>
          </AnalyticType>

          <AnalyticType
            onChange={doToggleAnalytics}
            enabled={analyticsEnabled}
            label={t('AnalyticsToggle.events.label')}
            summary={t('AnalyticsToggle.events.summary')}
            sourceLink='https://github.com/ipfs-shipyard/ipfs-webui/blob/38743dc9201795bc292e6ef132600622eb461cb2/src/bundles/analytics.js#L63-L87'
            exampleRequest='https://countly.ipfs.io/i?events=%5B%7B%22key%22%3A%22FILES_WRITE%22%2C%22count%22%3A1%2C%22dur%22%3A0.06761999998707324%2C%22timestamp%22%3A1552042116111%2C%22hour%22%3A10%2C%22dow%22%3A5%7D%5D&app_key=8fa213e6049bff23b08e5f5fbac89e7c27397612&device_id=d96d67ff-4797-45da-83b4-9e8f599cd12a&sdk_name=javascript_native_web&sdk_version=19.02.1&timestamp=1552042116112&hour=10&dow=5'>
            <p>
              <Trans i18nKey='AnalyticsToggle.events.details'>
                App specific actions. We record only that the action happened, how long it took from start to finish, and a count if the event involved multiple items.
              </Trans>
            </p>
            <p>The recorded actions are:</p>
            <ul>
              {analyticsActionsToRecord.map(name => (
                <li key={name} className='mb1'>
                  <code className='f7 bg-snow-muted pa1 br2'>{name}</code>
                </li>
              ))}
            </ul>
          </AnalyticType>

          <AnalyticType
            onChange={doToggleAnalytics}
            enabled={analyticsEnabled}
            label={t('AnalyticsToggle.pageviews.label')}
            summary={t('AnalyticsToggle.pageviews.summary')}
            sourceLink='https://github.com/ipfs-shipyard/ipfs-webui/blob/master/src/bundles/analytics.js#L46-L54'
            exampleRequest='https://countly.ipfs.io/i?events=%5B%7B%22key%22%3A%22%5BCLY%5D_view%22%2C%22count%22%3A1%2C%22dur%22%3A5%2C%22segmentation%22%3A%7B%22name%22%3A%22%2Ffiles*%22%7D%2C%22timestamp%22%3A1552041588790%2C%22hour%22%3A10%2C%22dow%22%3A5%7D%2C%7B%22key%22%3A%22%5BCLY%5D_view%22%2C%22count%22%3A1%2C%22segmentation%22%3A%7B%22name%22%3A%22%2F%22%2C%22visit%22%3A1%2C%22domain%22%3A%22localhost%22%2C%22view%22%3A%22%2F%22%7D%2C%22timestamp%22%3A1552041588791%2C%22hour%22%3A10%2C%22dow%22%3A5%7D%5D&app_key=8fa213e6049bff23b08e5f5fbac89e7c27397612&device_id=d96d67ff-4797-45da-83b4-9e8f599cd12a&sdk_name=javascript_native_web&sdk_version=19.02.1&location=&timestamp=1552041588792&hour=10&dow=5'>
            <p>{t('AnalyticsToggle.pageviews.details')}</p>
          </AnalyticType>

          <AnalyticType
            onChange={doToggleAnalytics}
            enabled={analyticsEnabled}
            label={t('AnalyticsToggle.location.label')}
            summary={t('AnalyticsToggle.location.summary')}
            sourceLink='https://github.com/Countly/countly-sdk-web/blob/93442edbe8c108618c88cc9e1ad179892c42940b/lib/countly.js#L1736-L1751'>
            <p>{t('AnalyticsToggle.location.details')}</p>
          </AnalyticType>

          <AnalyticType
            onChange={doToggleAnalytics}
            enabled={analyticsEnabled}
            label={t('AnalyticsToggle.crashes.label')}
            summary={t('AnalyticsToggle.crashes.summary')}
            sourceLink='https://github.com/ipfs-shipyard/ipfs-webui/blob/master/src/bundles/analytics.js#L46-L54'>
            <p>
              <Trans i18nKey='AnalyticsToggle.crashes.details'>
                Records JavaScript error messages and stack traces that occur while using the app, where possible. It is very helpful to know when the app is not working for you, but <b>error messages may include identifiable information</b> like CIDs or file paths, so only enable this if you are comfortable sharing that information with us.
              </Trans>
            </p>
          </AnalyticType>

        </Details>
      </div>
    </React.Fragment>
  )
}

export default AnalyticsToggle
