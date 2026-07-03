import React, { useState } from 'react'
import Button from '../button/button.tsx'
import { checkValidHttpUrl } from '../../bundles/gateway.js'

/**
 * Text input with Clear/Submit buttons for a gateway URL setting. We validate
 * the URL format only and trust the user's choice, so a private, offline, or
 * reverse-proxy gateway is not rejected. Empty is valid: it clears the setting
 * so the caller's fallback applies (e.g. the Kubo config gateway, or a native
 * ipfs:// share link).
 */
const GatewayForm = ({ t, savedValue, onUpdate, inputId, clearButtonId, submitButtonId, ariaLabel, placeholder }) => {
  const [value, setValue] = useState(savedValue)
  const isValid = value === '' || checkValidHttpUrl(value)

  const onSubmit = (event) => {
    event.preventDefault()
    if (!isValid) return
    onUpdate(value)
  }

  const onClear = (event) => {
    event.preventDefault()
    setValue('')
    onUpdate('')
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        id={inputId}
        aria-label={ariaLabel}
        placeholder={placeholder}
        type='text'
        className={`w-100 lh-copy monospace f5 pa2 mb2 charcoal input-reset ba b--black-20 br1 ${isValid ? 'focus-outline-green b--green-muted' : 'focus-outline-red b--red-muted'}`}
        onChange={(event) => setValue(event.target.value)}
        onKeyPress={onKeyPress}
        value={value}
      />
      <div className='tr'>
        <Button
          id={clearButtonId}
          minWidth={100}
          height={40}
          bg='bg-charcoal'
          className='tc'
          disabled={value === ''}
          onClick={onClear}>
          {t('app:actions.clear')}
        </Button>
        <Button
          id={submitButtonId}
          minWidth={100}
          height={40}
          className='mt2 mt0-l ml2 tc'
          disabled={!isValid || value === savedValue}>
          {t('actions.submit')}
        </Button>
      </div>
    </form>
  )
}

export default GatewayForm
