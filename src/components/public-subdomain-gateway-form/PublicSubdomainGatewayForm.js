import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import GatewayForm from '../gateway-form/GatewayForm.js'

// Empty clears the gateway; Share Links then fall back to a native ipfs:// URI.
const PublicSubdomainGatewayForm = ({ t, doUpdatePublicSubdomainGateway, publicSubdomainGateway }) => (
  <GatewayForm
    t={t}
    savedValue={publicSubdomainGateway}
    onUpdate={doUpdatePublicSubdomainGateway}
    inputId='public-subdomain-gateway'
    clearButtonId='public-subdomain-gateway-clear-button'
    submitButtonId='public-subdomain-gateway-submit-button'
    ariaLabel={t('terms.publicSubdomainGateway')}
    placeholder={t('publicSubdomainGatewayForm.placeholder')}
  />
)

export default connect(
  'doUpdatePublicSubdomainGateway',
  'selectPublicSubdomainGateway',
  withTranslation('app')(PublicSubdomainGatewayForm)
)
