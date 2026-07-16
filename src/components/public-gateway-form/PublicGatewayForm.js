import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import GatewayForm from '../gateway-form/GatewayForm.js'

// Empty clears the gateway; Share Links then fall back to a native ipfs:// URI.
const PublicGatewayForm = ({ t, doUpdatePublicGateway, publicGateway }) => (
  <GatewayForm
    t={t}
    savedValue={publicGateway}
    onUpdate={doUpdatePublicGateway}
    inputId='public-gateway'
    clearButtonId='public-path-gateway-clear-button'
    submitButtonId='public-path-gateway-submit-button'
    ariaLabel={t('terms.publicGateway')}
    placeholder={t('publicGatewayForm.placeholder')}
  />
)

export default connect(
  'doUpdatePublicGateway',
  'selectPublicGateway',
  withTranslation('app')(PublicGatewayForm)
)
