import React from 'react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n'
import { PublishModal } from './PublishModal'

export default {
  title: 'Files/Modals'
}

export const Publishing = () => (
    <div className="ma3">
        <PublishModal t={i18n.getFixedT('en', 'files')} onCancel={action('Cancel')} onSubmit={action('Publish')} />
    </div>
)
