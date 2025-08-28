import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Box from '../../components/box/Box.js'
import Button from '../../components/button/button'
import { GologLevelAutocomplete } from './golog-level-autocomplete'
import { useLogs } from '../../contexts/logs/index'

const GologLevelSection: React.FC = () => {
  const { t } = useTranslation('diagnostics')
  const { gologLevelString, subsystems, setLogLevelsBatch, actualLogLevels, calculateGologLevelString, parseGologLevelString, subsystemsToActualLevels } = useLogs()

  // Component state for editing
  const [value, setValue] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const globalLogLevel = actualLogLevels['(default)']

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
  }, [value, isValid, gologLevelString, globalLogLevel, setLogLevelsBatch])

  const onReset = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    if (gologLevelString !== null) {
      setValue(gologLevelString)
      setIsValid(true)
    }
  }, [gologLevelString])

  const canSubmit = useMemo(() => {
    return isValid && errorMessage === '' && calculateGologLevelString(subsystemsToActualLevels(parseGologLevelString(value))) !== gologLevelString
  }, [isValid, value, gologLevelString, errorMessage, calculateGologLevelString, subsystemsToActualLevels, parseGologLevelString])

  if (gologLevelString === null) {
    return (
      <Box className='mb3 pa4-l pa2'>
        <div className='mb2'>
          <h3 className='montserrat fw4 charcoal ma0 f5 mb2'>{t('logs.gologLevel.title')}</h3>
          <p className='charcoal-muted f6 mb3'>{t('logs.gologLevel.description')}</p>
          <div className='input-reset ba b--black-20 pa2 bg-light-gray f6 charcoal-muted'>
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
          <Trans i18nKey='logs.gologLevel.descriptionWithLink' t={t}>
            <a className='link blue' href='https://github.com/ipfs/kubo/blob/master/docs/environment-variables.md#golog_log_level' target='_blank' rel='noopener noreferrer'> </a>
          </Trans>
        </p>
        <form onSubmit={onSubmit}>
          <GologLevelAutocomplete
            value={value}
            onChange={setValue}
            subsystems={subsystems}
            placeholder={t('logs.gologLevel.description')}
            className='w-100 lh-copy monospace f5 mb2 charcoal input-reset'
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
              id='golog-level-reset-button'
              minWidth={100}
              bg='bg-charcoal'
              className='tc'
              disabled={value === gologLevelString}
              onClick={onReset}>
              {t('app:actions.reset')}
            </Button>
            <Button
              id='golog-level-submit-button'
              minWidth={100}
              className='mt2 mt0-ns ml0 ml2-ns tc'
              onClick={onSubmit}
              disabled={!canSubmit}>
              {t('app:actions.submit')}
            </Button>
          </div>
        </form>
      </div>
    </Box>
  )
}

export default GologLevelSection
