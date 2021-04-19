import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator'
import RemoveModal from './RemoveModal'

storiesOf('Files/Modals', module)
  .addDecorator(i18n)
  .add('Remove', () => (
    <div className='ma3'>
      <RemoveModal
        onCancel={action('Cancel')}
        onRemove={action('Remove')}
        files={4}
        folders={0} />
    </div>
  ))
