import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/Button'
import { checkValidAPIAddress } from '../../bundles/ipfs-provider';

const ApiAddressForm = ({ t, doUpdateIpfsApiAddress, ipfsApiAddress, ipfsInitFailed }) => {
  const [value, setValue] = useState(asAPIString(ipfsApiAddress))
  const [showFailState, setShowFailState] = useState(!checkValidAPIAddress(value) || ipfsInitFailed)

  // Updates the border of the input to indicate validity
  useEffect(() => {
    if (!checkValidAPIAddress(value)) { // Checks the multiaddr
      setShowFailState(true)
    } else if (ipfsInitFailed) { // Checks if we failed to connect
      setShowFailState(true)
    } else { // Otherwise, success
      setShowFailState(false)
    }
  }, [value, ipfsInitFailed])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    doUpdateIpfsApiAddress(value);
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
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
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
  'selectIpfsInitFailed',
  withTranslation('app')(ApiAddressForm)
)
