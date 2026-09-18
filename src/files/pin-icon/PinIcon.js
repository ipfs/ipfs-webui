import React from 'react'
import { withTranslation } from 'react-i18next'
import GlyphPin from '../../icons/GlyphPin.js'
import GlyphPinCloud from '../../icons/GlyphPinCloud.js'
import '../PendingAnimation.css'

/**
 * @param {{ t: import('i18next').TFunction, isFailedPin: boolean, isPendingPin: boolean, isRemotePin: boolean, pinned: boolean }} props
 * @returns {React.ReactElement}
 */
const PinningIcon = ({ t, isFailedPin, isPendingPin, isRemotePin, pinned }) => {
  if (isFailedPin) {
    return (
      <div className='br-100 o-70' title={t('pinningFailedClickToDismiss')} style={{ width: '2rem', height: '2rem' }}>
        <GlyphPinCloud style={{ fill: 'var(--theme-button-red)' }} />
      </div>
    )
  } else if (isPendingPin) {
    return (
      <div className='br-100 PendingAnimation' title={t('pinningRemotely')} style={{ width: '2rem', height: '2rem' }}>
        <GlyphPinCloud style={{ fill: 'var(--theme-brand-aqua)' }} />
      </div>
    )
  } else if (isRemotePin) {
    return (
      <div className='br-100 o-70' title={t('pinnedRemotely')} style={{ width: '2rem', height: '2rem' }}>
        <GlyphPinCloud style={{ fill: 'var(--theme-brand-aqua)' }} />
      </div>
    )
  } else if (pinned) {
    return (
      <div className='br-100 o-70' title={t('pinned')} style={{ width: '2rem', height: '2rem' }}>
        <GlyphPin style={{ fill: 'var(--theme-brand-aqua)' }} />
      </div>
    )
  } else {
    return (
      <div className='br-100 hide-child' title={t('app:actions.setPinning')} style={{ width: '2rem', height: '2rem' }}>
        <GlyphPin className='child' style={{ fill: 'var(--theme-text-secondary)' }} />
      </div>
    )
  }
}

export default withTranslation('files')(PinningIcon)
