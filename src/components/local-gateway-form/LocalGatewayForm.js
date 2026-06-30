import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/button.tsx'
import { checkValidHttpUrl, checkViaImgSrc } from '../../bundles/gateway.js'

const LocalGatewayForm = ({ t, doUpdateLocalGateway, localGateway }) => {
  // Empty value is valid: it means "use the gateway address from Kubo config".
  const [value, setValue] = useState(localGateway)
  const [isValid, setIsValid] = useState(localGateway === '' || checkValidHttpUrl(localGateway))
  const [showFailState, setShowFailState] = useState(!(localGateway === '' || checkValidHttpUrl(localGateway)))

  useEffect(() => {
    const valid = value === '' || checkValidHttpUrl(value)
    setIsValid(valid)
    setShowFailState(!valid)
  }, [value])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!isValid) return
    // A non-empty override must be reachable from the browser, otherwise it
    // would silently break download and preview links with no fallback.
    if (value !== '') {
      try {
        await checkViaImgSrc(value)
      } catch (e) {
        setShowFailState(true)
        return
      }
    }
    doUpdateLocalGateway(value)
  }

  const onClear = async (event) => {
    event.preventDefault()
    setValue('')
    doUpdateLocalGateway('')
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  const hasChanges = value !== localGateway

  return (
    <form onSubmit={onSubmit}>
      <input
        id='local-gateway'
        aria-label={t('terms.localGateway')}
        placeholder={t('localGatewayForm.placeholder', 'Enter a URL (http://localhost:8080)')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr'>
        <Button
          id='local-gateway-clear-button'
          minWidth={100}
          height={40}
          bg='bg-charcoal'
          className='tc'
          disabled={value === ''}
          onClick={onClear}>
          {t('app:actions.clear')}
        </Button>
        <Button
          id='local-gateway-submit-button'
          minWidth={100}
          height={40}
          className='mt2 mt0-l ml2-l tc'
          disabled={!isValid || !hasChanges}>
          {t('actions.submit')}
        </Button>
      </div>
    </form>
  )
}

export default connect(
  'doUpdateLocalGateway',
  'selectLocalGateway',
  withTranslation('app')(LocalGatewayForm)
)
