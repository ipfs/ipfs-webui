import React from 'react'
import { withTranslation } from 'react-i18next'
import GlyphCancel from '../icons/GlyphCancel.js'
import GlyphPinCloud from '../icons/hocs/GlyphPinCloud.js'
import '../files/PendingAnimation.css'

const Status = {
  Pending: 0,
  Completed: 1,
  Failed: 2
}

const Pin = (t, pin, status = Status.Pending, onDismiss) => {
  const [service, cid] = pin.split(':')

  let cloudClass = 'pa1'
  let alt = ''
  let dismissAlt = t('clickToDismiss')
  if (status === Status.Pending) {
    cloudClass += ' fill-aqua PendingAnimation'
    alt = t('pinningRemotely')
    dismissAlt = t('clickToCancel')
  } else if (status === Status.Completed) {
    cloudClass += ' fill-aqua'
    alt = t('pinningCompleted')
  } else if (status === Status.Failed) {
    cloudClass += ' fill-red'
    alt = t('pinningFailed')
  }

  return (<li className="flex w-100 bb b--light-gray items-center f6 charcoal" key={cid}>
    <GlyphPinCloud className={cloudClass} style={{ width: '36px' }} alt={alt} title={alt} failed={status === Status.Failed} />
    <span className="truncate">{cid}</span>
    <span className='gray mh2'>| {service}</span>
    <span className='br-100 o-70 ml-auto w2 h2' alt={dismissAlt} title={dismissAlt} >
      <button onClick={() => onDismiss(pin)} className='w2 h2 pa0'>
        <GlyphCancel className='fill-aqua' />
      </button>
    </span>
  </li>)
}

const PinsStatuses = ({ pendingPins, failedPins, completedPins, onDismissFailedPin, onDismissCompletedPin, doCancelPendingPin, t }) => {
  return (
    <div>
      <h3>{(pendingPins.length + failedPins.length + completedPins.length) > 0 ? t('remotePinningInProgress') : t('noPinsInProgress')}</h3>

      <ul className='pa0 ma0'>
        {completedPins.map(pin => Pin(t, pin, Status.Completed, onDismissCompletedPin))}
        {failedPins.map(pin => Pin(t, pin, Status.Failed, onDismissFailedPin))}
        {pendingPins.map(pin => Pin(t, pin, Status.Pending, doCancelPendingPin))}
      </ul>
    </div>
  )
}

export default withTranslation('files')(PinsStatuses)
