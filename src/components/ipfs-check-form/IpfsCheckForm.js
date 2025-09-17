import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/button.tsx'
import { checkValidHttpUrl, DEFAULT_IPFS_CHECK_URL } from '../../bundles/gateway.js'

const IpfsCheckForm = ({ t, doUpdateIpfsCheckUrl, ipfsCheckUrl }) => {
  const [value, setValue] = useState(ipfsCheckUrl)
  const initialIsValidUrl = !checkValidHttpUrl(value)
  const [showFailState, setShowFailState] = useState(initialIsValidUrl)
  const [isValidUrl, setIsValidUrl] = useState(initialIsValidUrl)

  // Updates the border of the input to indicate validity
  useEffect(() => {
    setShowFailState(!isValidUrl)
  }, [isValidUrl])

  // Updates the border of the input to indicate validity
  useEffect(() => {
    const isValid = checkValidHttpUrl(value)
    setIsValidUrl(isValid)
    setShowFailState(!isValid)
  }, [value])

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!isValidUrl) {
      setShowFailState(true)
      return
    }

    doUpdateIpfsCheckUrl(value)
  }

  const onDefault = async (event) => {
    event.preventDefault()
    setValue(DEFAULT_IPFS_CHECK_URL)
    doUpdateIpfsCheckUrl(DEFAULT_IPFS_CHECK_URL)
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        id='ipfs-check-url'
        aria-label={t('ipfsCheckForm.label')}
        placeholder={t('ipfsCheckForm.placeholder')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr'>
        <Button
          id='ipfs-check-default-button'
          minWidth={100}
          height={40}
          bg='bg-charcoal'
          className='tc'
          disabled={value === DEFAULT_IPFS_CHECK_URL}
          onClick={onDefault}>
          {t('app:actions.reset')}
        </Button>
        <Button
          id='ipfs-check-submit-button'
          minWidth={100}
          height={40}
          className='mt2 mt0-l ml2-l tc'
          disabled={!isValidUrl || value === ipfsCheckUrl}>
          {t('actions.submit')}
        </Button>
      </div>
    </form>
  )
}

export default connect(
  'doUpdateIpfsCheckUrl',
  'selectIpfsCheckUrl',
  withTranslation('app')(IpfsCheckForm)
)
