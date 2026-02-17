import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Box from '../../components/box/Box.js'
import Button from '../../components/button/button'
import { GologLevelAutocomplete } from './golog-level-autocomplete'
import { useLogs } from '../../contexts/logs/index'
import { parseGologLevelString, subsystemsToActualLevels, calculateGologLevelString } from '../../lib/golog-level-utils'

const GologLevelSection: React.FC = () => {
  const { t } = useTranslation('diagnostics')
  const { gologLevelString, subsystems, setLogLevelsBatch } = useLogs()

  // Component state for editing
  const [value, setValue] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize value when gologLevelString is available
  useEffect(() => {
    if (gologLevelString !== null) {
      setValue(gologLevelString)
    }
  }, [gologLevelString])

  const onSubmit = useCallback(async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (!isValid || value === gologLevelString) {
      return
    }

    try {
      // Parse the GOLOG_LOG_LEVEL string using the utility function
      const levelsToSet = parseGologLevelString(value)

      // Validate the parsed levels
      for (const { subsystem, level } of levelsToSet) {
        if (level.trim() === '') {
          setErrorMessage(t('logs.gologLevel.invalidSubsystemLevel', { subsystem }))
          return
        }
      }

      await setLogLevelsBatch(levelsToSet)
    } catch (error: unknown) {
      console.error('Failed to save GOLOG_LOG_LEVEL:', error)
      setIsValid(false)
    }
  }, [isValid, value, gologLevelString, setLogLevelsBatch, t])

  const onCancel = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    if (gologLevelString !== null) {
      setValue(gologLevelString)
      setIsValid(true)
    }
  }, [gologLevelString])

  const onDefault = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    setValue('error')
    setIsValid(true)
  }, [])

  const canSubmit = useMemo(() => {
    return isValid && errorMessage === '' && calculateGologLevelString(subsystemsToActualLevels(parseGologLevelString(value))) !== gologLevelString
  }, [isValid, value, gologLevelString, errorMessage])

  if (gologLevelString === null) {
    return (
      <Box className='mb3 pa4-l pa2'>
        <div className='mb2'>
          <h3 className='montserrat fw4 ma0 f5 mb2' style={{ color: 'var(--theme-text-primary)' }}>{t('logs.gologLevel.title')}</h3>
          <p className='f6 mb3' style={{ color: 'var(--theme-text-primary)' }}>{t('logs.gologLevel.placeholder')}</p>
          <div className='input-reset ba pa2 f6' style={{ background: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border-primary)', color: 'var(--theme-text-primary)' }}>
            {t('logs.entries.loading')}...
          </div>
        </div>
      </Box>
    )
  }

  return (
    <Box className='mb3 pa4-l pa2'>
      <div className='mb2'>
        <h3 className='ttu tracked f6 fw4 teal mt0 mb3'>{t('logs.gologLevel.title')}</h3>
        <p>
          <Trans i18nKey='logs.gologLevel.description' t={t}>
            <a className='link blue' href='https://github.com/ipfs/kubo/blob/master/docs/environment-variables.md#golog_log_level' target='_blank' rel='noopener noreferrer'> </a>
          </Trans>
        </p>
        <form onSubmit={onSubmit}>
          <GologLevelAutocomplete
            value={value}
            onChange={setValue}
            subsystems={subsystems}
            placeholder={t('logs.gologLevel.placeholder')}
            className='w-100 lh-copy monospace f5 mb2 input-reset'
            onSubmit={onSubmit}
            onValidityChange={setIsValid}
            onErrorChange={setErrorMessage}
          />
          {errorMessage && (
            <div className='f6 red pa2 mb2'>
              {errorMessage}
            </div>
          )}
          <div className='flex flex-column flex-row-ns justify-end'>
            <Button
              id='golog-level-default-button'
              minWidth={100}
              bg='bg-charcoal'
              className='tc'
              onClick={onDefault}
              disabled={value === 'error'}>
              {t('app:actions.default')}
            </Button>
            <Button
              id='golog-level-cancel-button'
              minWidth={100}
              bg='bg-charcoal'
              className='mt2 mt0-ns ml0 ml2-ns tc'
              disabled={value === gologLevelString}
              onClick={onCancel}>
              {t('app:actions.cancel')}
            </Button>
            <Button
              id='golog-level-submit-button'
              minWidth={100}
              className='mt2 mt0-ns ml0 ml2-ns tc'
              onClick={onSubmit}
              disabled={!canSubmit}>
              {t('app:actions.apply')}
            </Button>
          </div>
        </form>
      </div>
    </Box>
  )
}

export default GologLevelSection
