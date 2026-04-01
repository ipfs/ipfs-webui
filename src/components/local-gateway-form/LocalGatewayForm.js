import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/button.tsx'
import { checkValidHttpUrl } from '../../bundles/gateway.js'

const LocalGatewayForm = ({ t, doUpdateLocalGateway, localGateway }) => {
  const [value, setValue] = useState(localGateway)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    // Empty value is valid (means "use default from Kubo config")
    setIsValid(value === '' || checkValidHttpUrl(value))
  }, [value])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (isValid) {
      doUpdateLocalGateway(value)
    }
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
        placeholder={t('localGatewayForm.placeholder', 'e.g., https://ipfs.example.com')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${!isValid ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
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
      <p className='f6 charcoal-muted mt2 mb0'>
        {t('localGatewayForm.description', 'Set this to your gateway URL if accessing WebUI through a reverse proxy or from a different host. Leave empty to use the gateway address from Kubo config.')}
      </p>
    </form>
  )
}

export default connect(
  'doUpdateLocalGateway',
  'selectLocalGateway',
  withTranslation('app')(LocalGatewayForm)
)
