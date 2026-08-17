import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import GatewayForm from '../gateway-form/GatewayForm.js'

// Empty clears the override: the gateway address from the Kubo config applies.
const LocalGatewayForm = ({ t, doUpdateLocalGateway, localGateway }) => (
  <GatewayForm
    t={t}
    savedValue={localGateway}
    onUpdate={doUpdateLocalGateway}
    inputId='local-gateway'
    clearButtonId='local-gateway-clear-button'
    submitButtonId='local-gateway-submit-button'
    ariaLabel={t('terms.localGateway')}
    placeholder={t('localGatewayForm.placeholder', 'Enter a URL (http://localhost:8080)')}
  />
)

export default connect(
  'doUpdateLocalGateway',
  'selectLocalGateway',
  withTranslation('app')(LocalGatewayForm)
)
