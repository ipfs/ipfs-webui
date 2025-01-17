import React, { useState, useEffect, useCallback } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/button.tsx'
import { checkValidHttpUrl, checkSubdomainGateway, DEFAULT_SUBDOMAIN_GATEWAY } from '../../bundles/gateway.js'

const PublicSubdomainGatewayForm = ({ t, doUpdatePublicSubdomainGateway, publicSubdomainGateway }) => {
  const [value, setValue] = useState(publicSubdomainGateway)
  const initialIsValidGatewayUrl = !checkValidHttpUrl(value)
  const [isValidGatewayUrl, setIsValidGatewayUrl] = useState(initialIsValidGatewayUrl)

  // Updates the border of the input to indicate validity
  useEffect(() => {
    const abortController = new AbortController()
    const validateUrl = async () => {
      try {
        const isValid = await checkSubdomainGateway(value, abortController.signal)
        setIsValidGatewayUrl(isValid)
      } catch (error) {
        console.error('Error checking subdomain gateway:', error)
        setIsValidGatewayUrl(false)
      }
    }

    const handler = setTimeout(() => {
      validateUrl()
    }, 80) // debounce the input by 80ms so update is not triggered on every key press

    return () => {
      abortController.abort()
      // don't execute the last validation if the component is unmounted (value changes)
      clearTimeout(handler)
    }
  }, [value])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = useCallback(async (event) => {
    event.preventDefault()
    if (isValidGatewayUrl) {
      doUpdatePublicSubdomainGateway(value)
    }
  }, [isValidGatewayUrl, doUpdatePublicSubdomainGateway, value])

  const onReset = async (event) => {
    event.preventDefault()
    setValue(DEFAULT_SUBDOMAIN_GATEWAY)
    doUpdatePublicSubdomainGateway(DEFAULT_SUBDOMAIN_GATEWAY)
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
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${!isValidGatewayUrl ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr'>
        <Button
          id='public-subdomain-gateway-reset-button'
          minWidth={100}
          height={40}
          bg='bg-charcoal'
          className='tc'
          disabled={value === DEFAULT_SUBDOMAIN_GATEWAY}
          onClick={onReset}>
          {t('app:actions.reset')}
        </Button>
        <Button
          id='public-subdomain-gateway-submit-button'
          minWidth={100}
          height={40}
          className='mt2 mt0-l ml2-l tc'
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
