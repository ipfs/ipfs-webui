import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/Button'
import { checkValidAPIAddress } from '../../bundles/ipfs-provider';

const ApiAddressForm = ({ t, doUpdateIpfsApiAddress, ipfsApiAddress }) => {
  const [value, setValue] = useState(asAPIString(ipfsApiAddress))
  const [isValidAPIAddress, setIsValidAPIAddress] = useState(checkValidAPIAddress(value));
  const inputElement = useRef()

  // Updates "isValidAPIAddress" state
  useEffect(() => {
    setIsValidAPIAddress(checkValidAPIAddress(value));
  }, [value]);

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    const succeeded = await doUpdateIpfsApiAddress(value);

    // If the IPFS API address failed to update, refocus to the API address input
    if (!succeeded) {
      inputElement.current.focus()
    }
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
        aria-label={t('apiAddressForm.apiLabel')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${isValidAPIAddress ? 'focus-outline-green' : 'focus-outline-red'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
        ref={inputElement}
      />
      <div className='tr'>
        <Button className='tc'>{t('actions.submit')}</Button>
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
  withTranslation('app')(ApiAddressForm)
)
