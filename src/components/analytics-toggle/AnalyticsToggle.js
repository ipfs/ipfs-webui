import React, { useState } from 'react'
import { Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import Checkbox from '../checkbox/Checkbox.js'
import Details from '../details/Details.js'

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
        <button className='focus-outline bg-transparent pa3 bn link blue flex-none' onClick={() => setOpen(!isOpen)} style={{ minWidth: 100 }}>
          {isOpen ? 'Close' : 'Show me' }
        </button>
      </div>
      {isOpen && (
        <div className='ph3 nt2 pb3'>
          {children}
          {sourceLink && (
            <p>
              <a href={sourceLink} className='link blue' target='_blank' rel='noopener noreferrer'>View source</a>
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

const AnalyticsToggle = ({ analyticsActionsToRecord, analyticsConsent, doToggleConsent, doToggleAnalytics, analyticsEnabled, t, open }) => {
  return (
    <React.Fragment>
      <Checkbox className='dib' onChange={doToggleAnalytics} checked={analyticsEnabled} label={
        <span className='f5'>
          {t('AnalyticsToggle.label')}
        </span>
      } />
      <div className='f6 charcoal lh-copy'>
        <p className='mb0'>{t('AnalyticsToggle.paragraph1')}</p>
        <Details summaryText={t('AnalyticsToggle.summary')} className='pt2' open={open}>
          <p>
            <Trans i18nKey='AnalyticsToggle.paragraph2' t={t}>
              Protocol Labs hosts a <a className='link blue' href='https://count.ly/'>Countly</a> instance to record anonymous usage data for this app.
            </Trans>
          </p>
          <p>{t('AnalyticsToggle.optionalInfo')}</p>
          <AnalyticType
            onChange={() => doToggleConsent('sessions')}
            enabled={analyticsConsent.includes('sessions')}
            label={t('AnalyticsToggle.sessions.label')}
            summary={t('AnalyticsToggle.sessions.summary')}
            sourceLink='https://github.com/Countly/countly-sdk-web/blob/93442edbe8c108618c88cc9e1ad179892c42940b/lib/countly.js#L1885-L1953'
            exampleRequest='https://countly.ipfs.io/i?begin_session=1&metrics=%7B%22_app_version%22%3A%222.4.0%22%2C%22_ua%22%3A%22Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_14_2)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F72.0.3626.121%20Safari%2F537.36%22%2C%22_resolution%22%3A%221920x1080%22%2C%22_density%22%3A2%2C%22_locale%22%3A%22en-GB%22%7D&app_key=700fd825c3b257e021bd9dbc6cbf044d33477531&device_id=804117b1-c21d-4e55-a65f-f9dbbe9a1f91&sdk_name=javascript_native_web&sdk_version=19.02.1&timestamp=1552296210554&hour=9&dow=1&consent=%7B%22sessions%22%3Atrue%2C%22events%22%3Atrue%2C%22views%22%3Atrue%2C%22location%22%3Atrue%2C%22crashes%22%3Atrue%7D'>
            <Trans i18nKey='AnalyticsToggle.sessions.details' t={t}>
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
            </Trans>
          </AnalyticType>

          <AnalyticType
            onChange={() => doToggleConsent('events')}
            enabled={analyticsConsent.includes('events')}
            label={t('AnalyticsToggle.events.label')}
            summary={t('AnalyticsToggle.events.summary')}
            sourceLink='https://github.com/ipfs-shipyard/ipfs-webui/blob/30a077efe5198bf6403681b094ab585a88395c40/src/bundles/analytics.js#L93-L111'
            exampleRequest='https://countly.ipfs.io/i?events=%5B%7B%22key%22%3A%22FILES_MAKEDIR%22%2C%22count%22%3A1%2C%22dur%22%3A0.015194999985396862%2C%22timestamp%22%3A1552296333639%2C%22hour%22%3A9%2C%22dow%22%3A1%7D%5D&app_key=700fd825c3b257e021bd9dbc6cbf044d33477531&device_id=804117b1-c21d-4e55-a65f-f9dbbe9a1f91&sdk_name=javascript_native_web&sdk_version=19.02.1&timestamp=1552296333640&hour=9&dow=1'>
            <p>
              <Trans i18nKey='AnalyticsToggle.events.details' t={t}>
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
            onChange={() => doToggleConsent('views')}
            enabled={analyticsConsent.includes('views')}
            label={t('AnalyticsToggle.views.label')}
            summary={t('AnalyticsToggle.views.summary')}
            sourceLink='https://github.com/ipfs-shipyard/ipfs-webui/blob/2fb9df4e7b294f26b35b1dd76084fe85672b6f2b/src/bundles/analytics.js#L81-L86'
            exampleRequest='https://countly.ipfs.io/i?events=%5B%7B%22key%22%3A%22%5BCLY%5D_view%22%2C%22count%22%3A1%2C%22dur%22%3A2%2C%22segmentation%22%3A%7B%22name%22%3A%22%2F%22%7D%2C%22timestamp%22%3A1552296364914%2C%22hour%22%3A9%2C%22dow%22%3A1%7D%2C%7B%22key%22%3A%22%5BCLY%5D_view%22%2C%22count%22%3A1%2C%22segmentation%22%3A%7B%22name%22%3A%22%2Ffiles*%22%2C%22visit%22%3A1%2C%22domain%22%3A%22localhost%22%2C%22view%22%3A%22%2F%22%7D%2C%22timestamp%22%3A1552296364915%2C%22hour%22%3A9%2C%22dow%22%3A1%7D%5D&app_key=700fd825c3b257e021bd9dbc6cbf044d33477531&device_id=804117b1-c21d-4e55-a65f-f9dbbe9a1f91&sdk_name=javascript_native_web&sdk_version=19.02.1&timestamp=1552296364916&hour=9&dow=1'>
            <p>{t('AnalyticsToggle.views.details')}</p>
          </AnalyticType>

          <AnalyticType
            onChange={() => doToggleConsent('location')}
            enabled={analyticsConsent.includes('location')}
            label={t('AnalyticsToggle.location.label')}
            summary={t('AnalyticsToggle.location.summary')}
            sourceLink='https://github.com/Countly/countly-sdk-web/blob/93442edbe8c108618c88cc9e1ad179892c42940b/lib/countly.js#L1736-L1751'>
            <p>{t('AnalyticsToggle.location.details')}</p>
          </AnalyticType>

          <AnalyticType
            onChange={() => doToggleConsent('crashes')}
            enabled={analyticsConsent.includes('crashes')}
            label={t('AnalyticsToggle.crashes.label')}
            summary={t('AnalyticsToggle.crashes.summary')}
            sourceLink='https://github.com/ipfs-shipyard/ipfs-webui/blob/2fb9df4e7b294f26b35b1dd76084fe85672b6f2b/src/bundles/analytics.js#L115-L121'
            exampleRequest='https://countly.ipfs.io/i?crash=%7B%22_resolution%22%3A%221920x1080%22%2C%22_error%22%3A%22Error%3A%20example%20error%5Cn%20%20%20%20at%20Object._callee%24%20(http%3A%2F%2Flocalhost%3A3000%2Fstatic%2Fjs%2Fbundle.js%3A192105%3A63)%5Cn%20%20%20%20at%20tryCatch%20(http%3A%2F%2Flocalhost%3A3000%2Fstatic%2Fjs%2Fbundle.js%3A173974%3A40)%5Cn%20%20%20%20at%20Generator.invoke%20%5Bas%20_invoke%5D%20(http%3A%2F%2Flocalhost%3A3000%2Fstatic%2Fjs%2Fbundle.js%3A174208%3A22)%5Cn%20%20%20%20at%20Generator.prototype.(anonymous%20function)%20%5Bas%20next%5D%20(http%3A%2F%2Flocalhost%3A3000%2Fstatic%2Fjs%2Fbundle.js%3A174026%3A21)%5Cn%20%20%20%20at%20step%20(http%3A%2F%2Flocalhost%3A3000%2Fstatic%2Fjs%2Fbundle.js%3A192086%3A191)%5Cn%20%20%20%20at%20http%3A%2F%2Flocalhost%3A3000%2Fstatic%2Fjs%2Fbundle.js%3A192086%3A361%22%2C%22_app_version%22%3A%222.4.0%22%2C%22_run%22%3A5%2C%22_not_os_specific%22%3Atrue%2C%22_online%22%3Atrue%2C%22_background%22%3Atrue%2C%22_logs%22%3A%22STATS_FETCH_FAILED%22%2C%22_nonfatal%22%3Atrue%2C%22_view%22%3A%22%2F%23%2Fsettings%22%2C%22_custom%22%3Anull%2C%22_opengl%22%3A%22WebGL%201.0%20(OpenGL%20ES%202.0%20Chromium)%22%7D&app_key=700fd825c3b257e021bd9dbc6cbf044d33477531&device_id=d96d67ff-4797-45da-83b4-9e8f599cd12a&sdk_name=javascript_native_web&sdk_version=19.02.1&timestamp=1552294449012&hour=8&dow=1'>
            <p>
              <Trans i18nKey='AnalyticsToggle.crashes.details' t={t}>
                Records JavaScript error messages and stack traces that occur while using the app, where possible. It is very helpful to know when the app is not working for you, but <b>error messages may include identifiable information</b> like CIDs or file paths, so only enable this if you are comfortable sharing that information with us.
              </Trans>
            </p>
          </AnalyticType>

        </Details>
      </div>
    </React.Fragment>
  )
}

export default connect(
  'selectAnalyticsEnabled',
  'selectAnalyticsConsent',
  'selectAnalyticsActionsToRecord',
  'doToggleAnalytics',
  'doToggleConsent',
  AnalyticsToggle
)
