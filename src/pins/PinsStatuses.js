import React from 'react'
import { withTranslation } from 'react-i18next'
import DocumentIcon from '../icons/GlyphDocGeneric'
import GlyphPinCloud from '../icons/GlyphPinCloud'
import '../files/file/PendingAnimation.css'

const Status = {
  Pending: 0,
  Completed: 1,
  Failed: 2
}

const Pin = (t, pin, status = Status.Pending, onDismiss) => {
  const [service, cid] = pin.split(':')

  let cloudClass = ''
  let alt = ''
  if (status === Status.Pending) {
    cloudClass = 'fill-aqua PendingAnimation'
    alt = t('pinningRemotely')
  } else if (status === Status.Completed) {
    cloudClass = 'fill-aqua'
    alt = t('pinningCompletedClickToDismiss')
  } else if (status === Status.Failed) {
    cloudClass = 'fill-red'
    alt = t('pinningFailedClickToDismiss')
  }

  const el = onDismiss
    ? <button onClick={() => onDismiss(pin)} className='w2 h2 pa0'>
      <GlyphPinCloud className={cloudClass} />
    </button>
    : <GlyphPinCloud className={cloudClass} />

  return (<li className="flex w-100 bb b--light-gray items-center f6 charcoal" key={cid}>
    <DocumentIcon className="fill-aqua pa1 w1" style={{ width: '36px' }} />
    <span className="truncate">{cid}</span>
    <span className='gray mh2'>| {service}</span>
    <span className='br-100 o-70 ml-auto w2 h2' alt={alt} title={alt} >
      {el}
    </span>
  </li>)
}

const PinsStatuses = ({ pendingPins, failedPins, completedPins, onDismissFailedPin, onDismissCompletedPin, t }) => {
  return (
    <div>
      <h3>Pins</h3>

      <ul className='pa0 ma0'>
        {completedPins.map(pin => Pin(t, pin, Status.Completed, onDismissCompletedPin))}
        {failedPins.map(pin => Pin(t, pin, Status.Failed, onDismissFailedPin))}
        {pendingPins.map(pin => Pin(t, pin, Status.Pending))}
      </ul>
    </div>
  )
}

export default withTranslation('files')(PinsStatuses)
