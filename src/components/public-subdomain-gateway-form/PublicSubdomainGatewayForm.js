import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/button.tsx'
import { checkValidHttpUrl } from '../../bundles/gateway.js'

const PublicSubdomainGatewayForm = ({ t, doUpdatePublicSubdomainGateway, publicSubdomainGateway }) => {
  // We validate the URL format only and trust the user's choice, so a private or
  // offline gateway is not rejected. Empty is valid: it clears the gateway, and
  // Share Links fall back to a native ipfs:// URI.
  const [value, setValue] = useState(publicSubdomainGateway)
  const isValidGatewayUrl = value === '' || checkValidHttpUrl(value)
  const [showFailState, setShowFailState] = useState(!isValidGatewayUrl)

  // Updates the border of the input to indicate validity
  useEffect(() => {
    setShowFailState(!(value === '' || checkValidHttpUrl(value)))
  }, [value])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = (event) => {
    event.preventDefault()
    if (!isValidGatewayUrl) return
    doUpdatePublicSubdomainGateway(value)
  }

  const onClear = (event) => {
    event.preventDefault()
    setValue('')
    doUpdatePublicSubdomainGateway('')
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        id='public-subdomain-gateway'
        aria-label={t('terms.publicSubdomainGateway')}
        placeholder={t('publicSubdomainGatewayForm.placeholder')}
        type='text'
        className={`w-100 lh-copy monospace f5 pa2 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr'>
        <Button
          id='public-subdomain-gateway-clear-button'
          minWidth={100}
          height={40}
          bg='bg-charcoal'
          className='tc'
          disabled={value === ''}
          onClick={onClear}>
          {t('app:actions.clear')}
        </Button>
        <Button
          id='public-subdomain-gateway-submit-button'
          minWidth={100}
          height={40}
          className='mt2 mt0-l ml2 tc'
          disabled={!isValidGatewayUrl || value === publicSubdomainGateway}>
          {t('actions.submit')}
        </Button>
      </div>
    </form>
  )
}

export default connect(
  'doUpdatePublicSubdomainGateway',
  'selectPublicSubdomainGateway',
  withTranslation('app')(PublicSubdomainGatewayForm)
)
