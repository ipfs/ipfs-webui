import React, { useState, useEffect } from 'react'
import { withTranslation } from 'react-i18next'
import { createConnectedComponent } from '../connected-component.js'
import Button from '../button/button.jsx'
import { checkValidAPIAddress } from '../../bundles/ipfs-provider.js'

// @ts-expect-error - Component not fully migrated to TypeScript yet
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

  // @ts-expect-error - Component not fully migrated to TypeScript yet
  const onChange = (event) => setValue(event.target.value)

  // @ts-expect-error - Component not fully migrated to TypeScript yet
  const onSubmit = async (event) => {
    event.preventDefault()
    doUpdateIpfsApiAddress(value)
  }

  // @ts-expect-error - Component not fully migrated to TypeScript yet
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
          // @ts-expect-error - Button is not typed
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
 * @param {string|number|object|null|undefined} value
 * @returns {string}
 */
const asAPIString = (value) => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

/**
 * @typedef {Object} ReduxBundlerProps
 * @property {(value: string) => void} doUpdateIpfsApiAddress
 * @property {string} selectIpfsApiAddress
 * @property {boolean} selectIpfsInitFailed
 */

/**
 * @template {ReduxBundlerProps}
 */
export default createConnectedComponent(
  withTranslation('app')(ApiAddressForm),
  'doUpdateIpfsApiAddress',
  'selectIpfsApiAddress',
  'selectIpfsInitFailed'
)
