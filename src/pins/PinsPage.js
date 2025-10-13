import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import PinsStatuses from './PinsStatuses.js'

/**
 * @param {Object} props
 * @param {string[]} props.pendingPins
 * @param {string[]} props.failedPins
 * @param {string[]} props.completedPins
 * @param {(pin: string) => void} props.doDismissCompletedPin
 * @param {(pin: string) => void} props.doDismissFailedPin
 * @param {(pin: string) => void} props.doCancelPendingPin
 */
const PinsPage = ({ pendingPins, failedPins, completedPins, doDismissCompletedPin, doDismissFailedPin, doCancelPendingPin }) => {
  return (
    <div data-id='PinsPage' className='mw9 center'>
      <Helmet>
        <title>Pins Status</title>
      </Helmet>

      <PinsStatuses
        pendingPins={pendingPins}
        failedPins={failedPins}
        completedPins={completedPins}
        doCancelPendingPin={doCancelPendingPin}
        onDismissCompletedPin={doDismissCompletedPin}
        onDismissFailedPin={doDismissFailedPin} />
    </div>
  )
}

export default connect(
  'selectPendingPins',
  'selectFailedPins',
  'selectCompletedPins',
  'doDismissCompletedPin',
  'doDismissFailedPin',
  'doCancelPendingPin',
  withTranslation('files')(PinsPage)
)
