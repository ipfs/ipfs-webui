import React, { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../../components/box/Box.js'
import Button from '../../components/button/button'
import { GologLevelAutocomplete } from './golog-level-autocomplete'
import { useLogs } from '../../contexts/logs/index'

const GologLevelSection: React.FC = () => {
  const { t } = useTranslation('diagnostics')
  const { gologLevelString, subsystems, setLogLevelsBatch, globalLogLevel } = useLogs()

  // Component state for editing
  const [value, setValue] = useState('')
  const [isValid, setIsValid] = useState(true)

  // Initialize value when gologLevelString is available
  useEffect(() => {
    if (gologLevelString !== null) {
      setValue(gologLevelString)
    }
  }, [gologLevelString])

  const onChange = useCallback((newValue: string) => {
    setValue(newValue)
    // Validation is now handled by the GologLevelAutocomplete component
    setIsValid(true) // We'll let the autocomplete handle validation
  }, [])

  const onSubmit = useCallback(async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (!isValid || value === gologLevelString) {
      return
    }

    try {
      // Parse the GOLOG_LOG_LEVEL string and build complete batch of changes
      const parts = value.split(',')
      const levelsToSet = []
      let globalLevel = null

      // Parse all parts to find global level and subsystem levels (global level may not always be first)
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim()

        if (part.includes('=')) {
          // This is a subsystem=level part
          const equalIndex = part.indexOf('=')
          const subsystemName = part.substring(0, equalIndex).trim()
          const level = part.substring(equalIndex + 1).trim()

          // Always include this subsystem level from the string
          levelsToSet.push({ subsystem: subsystemName, level })
        } else if (part && !globalLevel) {
          // This is a global level (first non-empty part without equals)
          globalLevel = part
        }
      }

      // Add global level if found and different from current
      if (globalLevel && globalLogLevel !== globalLevel) {
        levelsToSet.push({ subsystem: '*', level: globalLevel })
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

  if (gologLevelString === null) {
    return (
      <Box className='mb3' style={{}}>
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
    <Box className='mb3' style={{}}>
      <div className='mb2'>
        <h3 className='montserrat fw4 charcoal ma0 f5 mb2'>{t('logs.gologLevel.title')}</h3>
        <p className='charcoal-muted f6 mb3'>{t('logs.gologLevel.description')}</p>
        <form onSubmit={onSubmit}>
          <GologLevelAutocomplete
            value={value}
            onChange={onChange}
            subsystems={subsystems}
            placeholder={t('logs.gologLevel.description')}
            className='w-100 lh-copy monospace f5 mb2 charcoal input-reset'
            onSubmit={() => onSubmit()}
            onValidityChange={setIsValid}
          />
          <div className='tr'>
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
              className='mt2 mt0-l ml2-l tc'
              disabled={!isValid || value === gologLevelString}>
              {t('app:actions.submit')}
            </Button>
          </div>
        </form>
      </div>
    </Box>
  )
}

export default GologLevelSection
