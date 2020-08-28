import React, { useState } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/Button'

const ApiAddressForm = ({ t, doUpdateIpfsApiAddress, ipfsApiAddress = '' }) => {
  const [value, setValue] = useState(ipfsApiAddress)

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
      <input id='api-address'
        aria-label={t('apiAddressForm.apiLabel')}
        type='text'
        className='w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 focus-outline'
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value} />
      <div className='tr'>
        <Button className="tc">{t('apiAddressForm.submitButton')}</Button>
      </div>
    </form>
  )
}

export default connect(
  'doUpdateIpfsApiAddress',
  'selectIpfsApiAddress',
  withTranslation('welcome')(ApiAddressForm)
)
