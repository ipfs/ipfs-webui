import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { checkValidAPIAddress } from '../../bundles/ipfs-provider'

import RetroInput from '../common/atoms/RetroInput'
// import RetroButton from '../common/atoms/RetroButton'
import FullGradientButton from '../common/atoms/FullGradientButton'
import RetroText from '../common/atoms/RetroText'

const ApiAddressForm = ({ t, doUpdateIpfsApiAddress, ipfsApiAddress, ipfsInitFailed, ...rest }) => {
  const [value, setValue] = useState(asAPIString(ipfsApiAddress))
  const initialIsValidApiAddress = !checkValidAPIAddress(value)
  const [showFailState, setShowFailState] = useState(initialIsValidApiAddress || ipfsInitFailed)
  const [isValidApiAddress, setIsValidApiAddress] = useState(initialIsValidApiAddress)

  // Updates the border of the input to indicate validity
  useEffect(() => {
    setShowFailState(ipfsInitFailed)
  }, [isValidApiAddress, ipfsInitFailed])

  // Updates the border of the input to indicate validity
  useEffect(() => {
    const isValid = checkValidAPIAddress(value)
    setIsValidApiAddress(isValid)
    setShowFailState(!isValid)
  }, [value])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    doUpdateIpfsApiAddress(value)
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <RetroInput
        withoutShadow
        id='api-address'
        aria-label={t('terms.apiAddress')}
        placeholder={t('apiAddressForm.placeholder')}
        bg='#1d182c'
        border={'1px solid #FA5050'}
        type='text'
        padding={5}
        className={`w-100 lh-copy spacegrotesk bg-near-purple f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
        width='100%'
        {...rest}
      />
      <div className='tc mt4' >
        <FullGradientButton
          width='163px'
          height='38px'
          className='mt2 mt0-l ml2-l tc'
          disabled={!isValidApiAddress || value === ipfsApiAddress}>
          <RetroText color={!isValidApiAddress || value === ipfsApiAddress ? '#9C9C9C' : '#000'}>
            {t('actions.submit')}
          </RetroText>
        </FullGradientButton>
      </div>
    </form>
  )
}

/**
 * @returns {string}
 */
const asAPIString = (value) => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

export default connect(
  'doUpdateIpfsApiAddress',
  'selectIpfsApiAddress',
  'selectIpfsInitFailed',
  withTranslation('app')(ApiAddressForm)
)
