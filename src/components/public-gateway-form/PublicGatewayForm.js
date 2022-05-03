import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { checkValidHttpUrl, checkViaImgSrc, DEFAULT_GATEWAY } from '../../bundles/gateway'

import RetroInput from '../common/atoms/RetroInput'
// import RetroButton from '../common/atoms/RetroButton'
import BlueGradientButton from '../common/atoms/BlueGradientButton'
import RetroText from '../common/atoms/RetroText'
import BlueBorderButton from '../common/atoms/BlueBorderButton'
import styled from 'styled-components'

const StyledInputContainer = styled.div`
  width: 100%;
  border: 1px solid #312F62;
  padding: 6px;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
`

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

    try {
      await checkViaImgSrc(value)
    } catch (e) {
      setShowFailState(true)
      return
    }

    doUpdatePublicGateway(value)
  }

  const onReset = async (event) => {
    event.preventDefault()
    setValue(DEFAULT_GATEWAY)
    doUpdatePublicGateway(DEFAULT_GATEWAY)
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className='flex'>
        <StyledInputContainer >
          <RetroInput
            id='public-gateway'
            aria-label={t('terms.publicGateway')}
            placeholder={t('publicGatewayForm.placeholder')}
            type='text'
            height='40px'
            border='none'
            className={`w-100 lh-copy spacegrotesk f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
            onChange={onChange}
            onKeyPress={onKeyPress}
            value={value}
          />

          <BlueBorderButton
            width='100px'
            height='28px'
            bg='bg-charcoal'
            className='tc'
            disabled={value === DEFAULT_GATEWAY}
            onClick={onReset}>
            <RetroText color={value === DEFAULT_GATEWAY ? 'white' : 'white'}>
              {t('app:actions.reset')}
            </RetroText>
          </BlueBorderButton>
          <BlueGradientButton
            width='100px'
            height='28px'
            className='mt2 mt0-l ml2-l tc'
            disabled={!isValidGatewayUrl || value === publicGateway}>
            <RetroText color={!isValidGatewayUrl || value === publicGateway ? 'white' : 'white'}>
              {t('actions.submit')}
            </RetroText>
          </BlueGradientButton>
        </StyledInputContainer>

      </div>
    </form>
  )
}

export default connect(
  'doUpdatePublicGateway',
  'selectPublicGateway',
  withTranslation('app')(PublicGatewayForm)
)
