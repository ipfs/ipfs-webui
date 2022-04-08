
import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import i18nDecorator from '../i18n-decorator'
import PinsStatuses from './PinsStatuses'

storiesOf('Pins/PinsStatuses', module)
  .addDecorator(i18nDecorator)
  .addDecorator(checkA11y)
  .add('Default', () => (
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
        onDismissCompletedPin={action('Dismiss Completed')}
        onDismissFailedPin={action('Dismiss Failed')}
      />
    </div>
  ))
