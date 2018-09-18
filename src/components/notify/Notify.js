import React from 'react'
import { connect } from 'redux-bundler-react'
import Toast from './Toast'

const Notify = ({ notify, notifyContent, doNotifyDismiss }) => {
  const { show, error } = notify
  if (!show) return null

  return (
    <Toast error={error} onDismiss={doNotifyDismiss}>
      {notifyContent}
    </Toast>
  )
}

export default connect(
  'selectNotify',
  'selectNotifyContent',
  'doNotifyDismiss',
  Notify
)
