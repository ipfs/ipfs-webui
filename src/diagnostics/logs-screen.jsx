import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createConnectedComponent } from '../components/connected-component.jsx'
import Box from '../components/box/Box.js'
import Button from '../components/button/button.jsx'

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal']

const LogsScreen = ({
  logEntries,
  logSubsystems,
  isLogStreaming,
  globalLogLevel,
  isLoadingSubsystems,
  doFetchLogSubsystems,
  doSetLogLevel,
  doStartLogStreaming,
  doStopLogStreaming,
  doClearLogEntries
}) => {
  const { t } = useTranslation('diagnostics')

  // Ensure we have safe defaults for arrays
  const safeLogEntries = Array.isArray(logEntries) ? logEntries : []
  const safeLogSubsystems = Array.isArray(logSubsystems) ? logSubsystems : []

  useEffect(() => {
    doFetchLogSubsystems()
  }, [doFetchLogSubsystems])

  const handleLevelChange = (subsystem, level) => {
    doSetLogLevel(subsystem, level)
  }

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'debug': return 'gray'
      case 'info': return 'blue'
      case 'warn': return 'orange'
      case 'error': return 'red'
      case 'dpanic':
      case 'panic':
      case 'fatal': return 'darkred'
      default: return 'black'
    }
  }

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString()
    } catch {
      return timestamp
    }
  }

  return (
    <div>
      <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('logs.title')}</h2>
      <p className='charcoal-muted mb4'>{t('logs.description')}</p>

      {/* Streaming Controls */}
      <Box className='mb3' style={{}}>
        <div className='flex items-center justify-between mb3'>
          <h3 className='montserrat fw4 charcoal ma0 f5'>{t('logs.streaming.status', { status: isLogStreaming ? 'Active' : 'Stopped' })}</h3>
          <div className='flex gap2'>
            <Button
              className={`mr2 ${isLogStreaming ? 'bg-red white' : 'bg-green white'}`}
              onClick={isLogStreaming ? doStopLogStreaming : doStartLogStreaming}
            >
              {isLogStreaming ? t('logs.streaming.stop') : t('logs.streaming.start')}
            </Button>
            <Button className='bg-gray white' onClick={doClearLogEntries}>
              {t('logs.streaming.clear')}
            </Button>
          </div>
        </div>
      </Box>

      {/* Log Level Controls */}
      <Box className='mb3' style={{}}>
        <h3 className='montserrat fw4 charcoal ma0 f5 mb3'>{t('logs.levels.title')}</h3>

        {/* Global Log Level */}
        <div className='mb3'>
          <label className='db fw6 mb2'>{t('logs.levels.global')}</label>
          <select
            className='input-reset ba b--black-20 pa2 mr2'
            value={globalLogLevel}
            onChange={(e) => handleLevelChange('all', e.target.value)}
          >
            {LOG_LEVELS.map(level => (
              <option key={level} value={level}>
                {t(`logs.levels.${level}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Subsystem Log Levels */}
        <div>
          <label className='db fw6 mb2'>{t('logs.levels.subsystem')}</label>
          {isLoadingSubsystems
            ? (
            <p className='gray'>{t('logs.entries.loading')}</p>
              )
            : (
            <div className='grid grid-cols-3 gap3'>
              {safeLogSubsystems.map(subsystem => (
                <div key={subsystem.name} className='flex items-center'>
                  <span className='mr2 w4 truncate' title={subsystem.name}>
                    {subsystem.name}:
                  </span>
                  <select
                    className='input-reset ba b--black-20 pa1 f6'
                    value={subsystem.level}
                    onChange={(e) => handleLevelChange(subsystem.name, e.target.value)}
                  >
                    {LOG_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
              )}
        </div>
      </Box>

      {/* Log Entries */}
      <Box style={{}}>
        <h3 className='montserrat fw4 charcoal ma0 f5 mb3'>Log Entries ({safeLogEntries.length})</h3>
        <div
          className='ba b--black-20 pa2 bg-near-white f6 overflow-auto'
          style={{ height: '400px', fontFamily: 'Monaco, Consolas, monospace' }}
        >
          {safeLogEntries.length === 0
            ? (
            <p className='gray tc pa3'>{t('logs.entries.noEntries')}</p>
              )
            : (
            <div>
              {safeLogEntries.map((entry, index) => (
                <div key={index} className='flex mb1 lh-copy'>
                  <span className='w3 mr2 gray truncate' title={entry.timestamp}>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span
                    className='w3 mr2 fw6 truncate'
                    style={{ color: getLevelColor(entry.level) }}
                  >
                    {entry.level.toUpperCase()}
                  </span>
                  <span className='w4 mr2 blue truncate' title={entry.subsystem}>
                    {entry.subsystem}
                  </span>
                  <span className='flex-auto'>
                    {entry.message}
                  </span>
                </div>
              ))}
            </div>
              )}
        </div>
      </Box>
    </div>
  )
}

export default createConnectedComponent(
  LogsScreen,
  'selectLogEntries',
  'selectLogSubsystems',
  'selectIsLogStreaming',
  'selectGlobalLogLevel',
  'selectIsLoadingSubsystems',
  'doFetchLogSubsystems',
  'doSetLogLevel',
  'doStartLogStreaming',
  'doStopLogStreaming',
  'doClearLogEntries'
)
