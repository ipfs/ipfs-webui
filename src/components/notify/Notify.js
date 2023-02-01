import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Toast from './Toast.js'

const Notify = ({ t, notify, notifyI18nKey, doNotifyDismiss }) => {
  const { show, error, msgArgs } = notify
  if (!show) return null

  return (
    <Toast error={error} onDismiss={doNotifyDismiss}>
      {t(notifyI18nKey, msgArgs)}
    </Toast>
  )
}

export default connect(
  'selectNotify',
  'selectNotifyI18nKey',
  'doNotifyDismiss',
  withTranslation('notify')(Notify)
)
