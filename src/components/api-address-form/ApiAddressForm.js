import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/Button.js'
import { checkValidAPIAddress } from '../../bundles/ipfs-provider.js'

const ApiAddressForm = ({ t, doUpdateIpfsApiAddress, ipfsApiAddress, ipfsInitFailed }) => {
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
      <input
        id='api-address'
        aria-label={t('terms.apiAddress')}
        placeholder={t('apiAddressForm.placeholder')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr'>
        <Button
          minWidth={100}
          height={40}
          className='mt2 mt0-l ml2-l tc'
          disabled={!isValidApiAddress || value === ipfsApiAddress}>
          {t('actions.submit')}
        </Button>
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
