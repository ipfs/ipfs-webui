import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/Button'
import { checkValidHttpUrl } from '../../bundles/gateway'

const PublicGatewayForm = ({ t, doUpdatePublicGateway, publicGateway }) => {
  const [value, setValue] = useState(publicGateway)
  const initialIsValidGatewayUrl = !checkValidHttpUrl(value)
  const [showFailState, setShowFailState] = useState(initialIsValidGatewayUrl)
  const [isValidGatewayUrl, setIsValidGatewayUrl] = useState(initialIsValidGatewayUrl)

  // Updates the border of the input to indicate validity
  useEffect(() => {
    setShowFailState(!isValidGatewayUrl)
  }, [isValidGatewayUrl])

  // Updates the border of the input to indicate validity
  useEffect(() => {
    const isValid = checkValidHttpUrl(value)
    setIsValidGatewayUrl(isValid)
    setShowFailState(!isValid)
  }, [value])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    doUpdatePublicGateway(value)
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        id='public-gateway'
        aria-label={t('terms.publicGateway')}
        placeholder={t('publicGatewayForm.placeholder')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr'>
        <Button className='tc' disabled={!isValidGatewayUrl}>{t('actions.submit')}</Button>
      </div>
    </form>
  )
}

export default connect(
  'doUpdatePublicGateway',
  'selectPublicGateway',
  withTranslation('app')(PublicGatewayForm)
)
