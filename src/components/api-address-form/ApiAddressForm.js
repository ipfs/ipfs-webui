import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import GlyphAttention from '../../icons/GlyphAttention'
import Button from '../button/Button'

import './ApiAddressForm.css';

const ApiAddressForm = ({ 
  t, 
  doUpdateIpfsApiAddress,
  ipfsApiAddress,
  ipfsInvalidAddress,
  ipfsConnectionError,
}) => {
  const [value, setValue] = useState(asAPIString(ipfsApiAddress))
  const [errorText, setErrorText] = useState(null);

  useEffect(() => {
    if (ipfsInvalidAddress) {
      setErrorText('The given IPFS API address is invalid');
    } else if (ipfsConnectionError) {
      setErrorText(ipfsConnectionError);
    }
  }, [ipfsInvalidAddress, ipfsConnectionError])

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
        aria-label={t('apiAddressForm.apiLabel')}
        type='text'
        className='w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 focus-outline'
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr button-container'>
        <div className='error-container'>
          { errorText && <GlyphAttention style={{ height: 24 }} className='fill-red'/> }
          { errorText && <span>{ errorText }</span> }
        </div>
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
  'selectIpfsInvalidAddress',
  'selectIpfsConnectionError',
  withTranslation('app')(ApiAddressForm)
)
