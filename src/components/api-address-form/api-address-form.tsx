import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBridgeSelector } from '../../helpers/context-bridge'
import Button from '../button/button'

// Import the validation function from the bundle
import { checkValidAPIAddress as checkValidApiAddressOriginal } from '../../bundles/ipfs-provider.js'

interface ApiAddressFormProps {
  checkValidAPIAddress?: (address: string) => boolean
}

const ApiAddressForm: React.FC<ApiAddressFormProps> = ({ checkValidAPIAddress = checkValidApiAddressOriginal }) => {
  const { t } = useTranslation('app')

  // Get values from the context bridge (redux bundle is still source of truth)
  const ipfsApiAddress = useBridgeSelector<string>('selectIpfsApiAddress')
  const ipfsInitFailed = useBridgeSelector<boolean>('selectIpfsInitFailed')
  const doUpdateIpfsApiAddress = useBridgeSelector<(address: string) => Promise<boolean>>('doUpdateIpfsApiAddress')

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
  }, [value, checkValidAPIAddress])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    if (doUpdateIpfsApiAddress && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await doUpdateIpfsApiAddress(value)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [doUpdateIpfsApiAddress, value, isSubmitting])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isSubmitting) {
      onSubmit(event)
    }
  }, [onSubmit, isSubmitting])

  return (
    <form onSubmit={onSubmit}>
      <input
        id='api-address'
        aria-label={t('terms.apiAddress')}
        placeholder={t('apiAddressForm.placeholder')}
        type='text'
        className={`w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 ${showFailState ? 'focus-outline-red b--red-muted' : 'focus-outline-green b--green-muted'}`}
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={value}
      />
      <div className='tr'>
        <Button
          minWidth={100}
          // height={40}
          className='mt2 mt0-l ml2-l tc'
          disabled={!isValidApiAddress || value === ipfsApiAddress || isSubmitting}>
          {t('actions.submit')}
        </Button>
      </div>
    </form>
  )
}

/**
 * @returns {string}
 */
const asAPIString = (value: any): string => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

export default ApiAddressForm
