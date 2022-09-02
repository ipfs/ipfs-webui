import React from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18nDecorator from '../i18n-decorator'
import PinsStatuses from './PinsStatuses'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Pins/PinsStatuses',
  decorators: [i18nDecorator]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => (
  <div className='sans-serif pa2'>
    <PinsStatuses
      pendingPins={[
        'Pinata:QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
        'local:QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        'Pinata:QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx'
      ]}
      completedPins={[
        'Pinata:QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
        'local:QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        'Pinata:QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx'
      ]}
      failedPins={[
        'local:QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
        'Pinata:QmWHyrPWQnsz1wxHR219ooJDYTvxJPyZuDUPSDpdsAovN5',
        'local:QmdXzZ25cyzSF99csCQmmPZ1NTbWTe8qtKFaZKpZQPdTFB'
      ]}
      doCancelPendingPin={action('Cancel Pending')}
      onDismissCompletedPin={action('Dismiss Completed')}
      onDismissFailedPin={action('Dismiss Failed')}
    />
  </div>
)
