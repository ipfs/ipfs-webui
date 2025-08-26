import React, { useState, useEffect, useCallback } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/button.tsx'
import { checkValidHttpUrl, checkSubdomainGateway, DEFAULT_SUBDOMAIN_GATEWAY } from '../../bundles/gateway.js'

const PublicSubdomainGatewayForm = ({ t, doUpdatePublicSubdomainGateway, publicSubdomainGateway }) => {
  const [value, setValue] = useState(publicSubdomainGateway)
  const initialIsValidGatewayUrl = !checkValidHttpUrl(value)
  const [isValidGatewayUrl, setIsValidGatewayUrl] = useState(initialIsValidGatewayUrl)

  const validateUrl = useCallback(async (signal) => {
    try {
      const url = new URL(value) // test basic url creation
      // ensure the hostname is not an IP address. URL constructor will fail if we prefix with subdomain
      // eslint-disable-next-line no-new
      new URL(`https://example.${url.host}`)
    } catch {
      setIsValidGatewayUrl(false)
      console.error('URL is invalid. Must be a valid URL when prefixed with a subdomain (such as `http://{CID}.ipfs.{yourSubdomainGateway}`). IP addresses do not allow subdomains.')
      return
    }
    try {
      const isValid = await checkSubdomainGateway(value, signal)
      setIsValidGatewayUrl(isValid)
    } catch (error) {
      if (signal.aborted) return
      console.error('Error checking subdomain gateway:', error)
      setIsValidGatewayUrl(false)
    }
  }, [value])

  // Updates the border of the input to indicate validity
  useEffect(() => {
    const abortController = new AbortController()
    const handler = setTimeout(() => {
      validateUrl(abortController.signal)
    }, 200) // debounce the input by 200ms so img and subdomain check are not triggered on every key press

    return () => {
      abortController.abort('Ignore previous validation')
      // don't execute the last validation if the component is unmounted (value changes)
      clearTimeout(handler)
    }
  }, [value, validateUrl])

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
