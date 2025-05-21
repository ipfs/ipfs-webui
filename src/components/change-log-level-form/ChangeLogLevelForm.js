import React, { useState, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/button.tsx'
import { checkValidLogLevel } from '../../bundles/log-level.js'

const ChangeLogLevelForm = ({ t, ipfsInitFailed, ipfsLogLevel, ipfsLogLevelError, doUpdateLogLevel }) => {
  const [value, setValue] = useState(ipfsLogLevel)
  const [isValidLogLevel, setIsValidLogLevel] = useState(true)
  const [showFailState, setShowFailState] = useState(false)

  useEffect(() => {
    setShowFailState(ipfsLogLevelError || ipfsInitFailed)
  }, [ipfsInitFailed, ipfsLogLevelError])

  const onChange = (event) => {
    setValue(event.target.value)
    const isValid = checkValidLogLevel(event.target.value)
    setIsValidLogLevel(isValid)
    setShowFailState(!isValid)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    doUpdateLogLevel(value)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(e)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        id='api-address'
        aria-label={t('terms.apiAddress')}
        placeholder={t('changeLogLevelForm.placeholder')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={value}
      />
      <div className='tr'>
        <Button
          minWidth={100}
          height={40}
          className='mt2 mt0-l ml2-l tc'
          disabled={!isValidLogLevel || value === ipfsLogLevel}>
          {t('actions.submit')}
        </Button>
      </div>
    </form>
  )
}

export default connect(
  'selectIpfsInitFailed',
  'selectIpfsLogLevel',
  'selectIpfsLogLevelInitialized',
  'selectIpfsLogLevelError',
  'doUpdateLogLevel',
  withTranslation('app')(ChangeLogLevelForm)
)
