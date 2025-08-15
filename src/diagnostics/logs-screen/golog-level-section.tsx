import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../../components/box/Box.js'
import Button from '../../components/button/button'
import { GologLevelAutocomplete } from './golog-level-autocomplete'
import { useLogs } from '../../contexts/logs/index'

const GologLevelSection: React.FC = () => {
  const { t } = useTranslation('diagnostics')
  const { gologLevelString, subsystems, setLogLevelsBatch, globalLogLevel } = useLogs()

  // Component state for editing
  const [isEditingGologLevel, setIsEditingGologLevel] = useState(false)
  const [editableGologLevel, setEditableGologLevel] = useState('')
  const [gologLevelError, setGologLevelError] = useState('')
  const [copiedGologLevel, setCopiedGologLevel] = useState(false)

  const handleGologLevelEdit = useCallback(() => {
    setEditableGologLevel(gologLevelString || '')
    setIsEditingGologLevel(true)
    setGologLevelError('') // Clear any previous errors
  }, [gologLevelString])

  const handleGologLevelSave = useCallback(async () => {
    try {
      // Clear any previous errors
      setGologLevelError('')

      // Parse the GOLOG_LOG_LEVEL string and build complete batch of changes
      const parts = editableGologLevel.split(',')
      const levelsToSet = []
      let globalLevel = null

      // Parse all parts to find global level and subsystem levels (global level may not always be first)/
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

      // Close edit mode
      setIsEditingGologLevel(false)
    } catch (error: unknown) {
      console.error('Failed to save GOLOG_LOG_LEVEL:', error)

      // Extract error message from the error
      let errorMessage = t('logs.autocomplete.invalidLevel')

      // Try to extract more specific error message from the error
      if (error instanceof Error && error.message.includes('unrecognized level')) {
        // Extract the invalid level from the error message
        const match = error.message.match(/unrecognized level: "([^"]+)"/)
        if (match) {
          const invalidLevel = match[1]
          errorMessage = t('logs.autocomplete.invalidLevel') + `: "${invalidLevel}"`
        }
      }

      setGologLevelError(errorMessage)
    }
  }, [editableGologLevel, globalLogLevel, setLogLevelsBatch, t])

  const handleGologLevelCancel = useCallback(() => {
    setIsEditingGologLevel(false)
    setEditableGologLevel('')
    setGologLevelError('') // Clear any errors when canceling
  }, [])

  const copyGologLevelToClipboard = useCallback(async () => {
    if (gologLevelString == null) return
    try {
      await navigator.clipboard.writeText(gologLevelString)
      setCopiedGologLevel(true)
      setTimeout(() => setCopiedGologLevel(false), 1000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [gologLevelString])

  return (
    <Box className='mb3' style={{}}>
      <div className='mb2'>
        <h3 className='montserrat fw4 charcoal ma0 f5 mb2'>{t('logs.gologLevel.title')}</h3>
        <p className='charcoal-muted f6 mb3'>{t('logs.gologLevel.description')}</p>
        <div className='flex items-center gap2'>
          <div className='flex-auto'>
            {gologLevelString === null
              ? (
              <div className='input-reset ba b--black-20 pa2 bg-light-gray f6 charcoal-muted'>
                {t('logs.entries.loading')}...
              </div>
                )
              : isEditingGologLevel
                ? (
              <GologLevelAutocomplete
                value={editableGologLevel}
                onChange={setEditableGologLevel}
                subsystems={subsystems}
                placeholder={t('logs.gologLevel.description')}
                className='flex-auto'
                error={gologLevelError}
              />
                  )
                : (<div
                className='input-reset ba b--black-20 pa2 bg-light-gray f6 pointer'
                style={{
                  fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}
                onClick={handleGologLevelEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleGologLevelEdit()
                  }
                }}
                role="button"
                tabIndex={0}
                title={t('logs.gologLevel.clickToEdit')}
              >
                {gologLevelString}
              </div>)}
          </div>
          {isEditingGologLevel
            ? (
            <div className='flex gap2 self-start'>
              <Button
                className='bg-green white f6'
                onClick={handleGologLevelSave}
                title={t('logs.gologLevel.save')}
              >
                ✓ {t('logs.gologLevel.save')}
              </Button>
              <Button
                className='bg-gray white f6'
                onClick={handleGologLevelCancel}
                title={t('logs.gologLevel.cancel')}
              >
                ✕ {t('logs.gologLevel.cancel')}
              </Button>
            </div>
              )
            : (
            <div className='flex gap2'>
              <Button
                className='bg-blue white f6'
                onClick={handleGologLevelEdit}
                title={t('logs.gologLevel.edit')}
                disabled={gologLevelString === null}
              >
                {t('logs.gologLevel.edit')}
              </Button>
              <Button
                className='bg-blue white f6'
                onClick={copyGologLevelToClipboard}
                title={t('logs.gologLevel.copyToClipboard')}
                disabled={gologLevelString == null}
              >
                {copiedGologLevel ? t('logs.gologLevel.copied') : `${t('logs.gologLevel.copyToClipboard')}`}
              </Button>
            </div>
              )}
        </div>
      </div>
    </Box>
  )
}

export default GologLevelSection
