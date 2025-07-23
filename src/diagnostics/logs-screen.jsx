import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { createConnectedComponent } from '../components/connected-component.jsx'
import Box from '../components/box/Box.js'
import Button from '../components/button/button.jsx'
import LogWarningModal from '../components/log-warning-modal.tsx'

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal']

const LogsScreen = ({
  logEntries,
  logSubsystems,
  isLogStreaming,
  globalLogLevel,
  isLoadingSubsystems,
  logBufferConfig,
  logRateState,
  hasMoreHistory,
  isLoadingHistory,
  logStorageStats,
  doFetchLogSubsystems,
  doSetLogLevel,
  doStartLogStreaming,
  doStopLogStreaming,
  doClearLogEntries,
  doUpdateLogBufferConfig,
  doLoadHistoricalLogs,
  doUpdateStorageStats,
  doShowLogWarning,
  doAutoDisableStreaming
}) => {
  const { t } = useTranslation('diagnostics')

  // Component state
  const [warningModal, setWarningModal] = useState({ isOpen: false, type: null })
  const [pendingLevelChange, setPendingLevelChange] = useState(null)
  const [showBufferConfig, setShowBufferConfig] = useState(false)
  const [tempBufferConfig, setTempBufferConfig] = useState(logBufferConfig)

  // Refs for virtual scrolling
  const logContainerRef = useRef(null)
  const [isAtTop, setIsAtTop] = useState(false)

  // Ensure we have safe defaults for arrays
  const safeLogEntries = Array.isArray(logEntries) ? logEntries : []
  const safeLogSubsystems = Array.isArray(logSubsystems) ? logSubsystems : []

  useEffect(() => {
    doFetchLogSubsystems()
    doUpdateStorageStats()
  }, [doFetchLogSubsystems, doUpdateStorageStats])

  // Monitor for warnings and auto-disable
  useEffect(() => {
    if (logRateState.currentRate > logBufferConfig.warnThreshold &&
        !logRateState.hasWarned &&
        !logRateState.autoDisabled &&
        isLogStreaming) {
      setWarningModal({ isOpen: true, type: 'high-rate' })
    }
  }, [logRateState, logBufferConfig, isLogStreaming])

  useEffect(() => {
    if (logRateState.autoDisabled) {
      setWarningModal({ isOpen: true, type: 'auto-disable' })
    }
  }, [logRateState.autoDisabled])

  // Update temp config when buffer config changes
  useEffect(() => {
    setTempBufferConfig(logBufferConfig)
  }, [logBufferConfig])

  const handleLevelChange = (subsystem, level) => {
    // Check if this is enabling debug globally
    if (subsystem === 'all' && level === 'debug' && globalLogLevel !== 'debug') {
      setPendingLevelChange({ subsystem, level })
      setWarningModal({ isOpen: true, type: 'debug-global' })
      return
    }

    doSetLogLevel(subsystem, level)
  }

  const confirmLevelChange = () => {
    if (pendingLevelChange) {
      doSetLogLevel(pendingLevelChange.subsystem, pendingLevelChange.level)
      setPendingLevelChange(null)
    }
  }

  const handleScrollToTop = useCallback(() => {
    if (hasMoreHistory && !isLoadingHistory && safeLogEntries.length > 0) {
      const oldestEntry = safeLogEntries[0]
      if (oldestEntry?.timestamp) {
        doLoadHistoricalLogs(oldestEntry.timestamp, 100)
      }
    }
  }, [hasMoreHistory, isLoadingHistory, safeLogEntries, doLoadHistoricalLogs])

  // Monitor scroll position for infinite scroll
  const handleScroll = useCallback((e) => {
    const container = e.target
    const scrollTop = container.scrollTop
    const isNearTop = scrollTop < 50

    setIsAtTop(isNearTop)

    if (isNearTop && hasMoreHistory && !isLoadingHistory) {
      handleScrollToTop()
    }
  }, [hasMoreHistory, isLoadingHistory, handleScrollToTop])

  const applyBufferConfig = () => {
    doUpdateLogBufferConfig(tempBufferConfig)
    setShowBufferConfig(false)
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

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('logs.title')}</h2>
      <p className='charcoal-muted mb4'>{t('logs.description')}</p>

      {/* Rate Monitoring & Status */}
      <Box className='mb3' style={{}}>
        <div className='flex items-center justify-between mb3'>
          <div>
            <h3 className='montserrat fw4 charcoal ma0 f5'>
              {t('logs.streaming.status', { status: isLogStreaming ? 'Active' : 'Stopped' })}
            </h3>
            {isLogStreaming && (
              <div className='flex items-center mt2'>
                <span className='charcoal-muted f6 mr3'>
                  {t('logs.streaming.rate')}: {logRateState.currentRate.toFixed(1)} logs/sec
                </span>
                {logRateState.currentRate > logBufferConfig.warnThreshold && (
                  <span className='orange f6'>⚠️ {t('logs.streaming.highRate')}</span>
                )}
                {logRateState.autoDisabled && (
                  <span className='red f6'>🛑 {t('logs.streaming.autoDisabled')}</span>
                )}
              </div>
            )}
          </div>
          <div className='flex gap2'>
            <Button
              className={`mr2 ${isLogStreaming ? 'bg-red white' : 'bg-green white'}`}
              onClick={isLogStreaming ? doStopLogStreaming : doStartLogStreaming}
              disabled={logRateState.autoDisabled}
            >
              {isLogStreaming ? t('logs.streaming.stop') : t('logs.streaming.start')}
            </Button>
            <Button className='bg-gray white' onClick={doClearLogEntries}>
              {t('logs.streaming.clear')}
            </Button>
            <Button
              className='bg-blue white'
              onClick={() => setShowBufferConfig(!showBufferConfig)}
            >
              {t('logs.streaming.config')}
            </Button>
          </div>
        </div>

        {/* Storage Stats */}
        {logStorageStats && (
          <div className='bt b--black-20 pt3'>
            <h4 className='montserrat fw6 charcoal ma0 f6 mb2'>{t('logs.storage.title')}</h4>
            <div className='flex items-center gap3 charcoal-muted f6'>
              <span>{t('logs.storage.totalEntries')}: {logStorageStats.totalEntries.toLocaleString()}</span>
              <span>{t('logs.storage.estimatedSize')}: {formatBytes(logStorageStats.estimatedSize)}</span>
              <span>{t('logs.storage.memoryBuffer')}: {safeLogEntries.length}/{logBufferConfig.memory}</span>
            </div>
          </div>
        )}

        {/* Buffer Configuration */}
        {showBufferConfig && (
          <div className='bt b--black-20 pt3 mt3'>
            <h4 className='montserrat fw6 charcoal ma0 f6 mb3'>{t('logs.config.title')}</h4>
            <div className='grid grid-cols-2 gap3 mb3'>
              <div>
                <label className='db fw6 mb1 f6'>{t('logs.config.memoryBuffer')}</label>
                <input
                  type='number'
                  className='input-reset ba b--black-20 pa2 w-100'
                  value={tempBufferConfig.memory}
                  onChange={(e) => setTempBufferConfig({
                    ...tempBufferConfig,
                    memory: parseInt(e.target.value) || 500
                  })}
                  min='100'
                  max='2000'
                />
              </div>
              <div>
                <label className='db fw6 mb1 f6'>{t('logs.config.persistentBuffer')}</label>
                <input
                  type='number'
                  className='input-reset ba b--black-20 pa2 w-100'
                  value={tempBufferConfig.indexedDB}
                  onChange={(e) => setTempBufferConfig({
                    ...tempBufferConfig,
                    indexedDB: parseInt(e.target.value) || 10000
                  })}
                  min='1000'
                  max='100000'
                />
              </div>
              <div>
                <label className='db fw6 mb1 f6'>{t('logs.config.warnThreshold')}</label>
                <input
                  type='number'
                  className='input-reset ba b--black-20 pa2 w-100'
                  value={tempBufferConfig.warnThreshold}
                  onChange={(e) => setTempBufferConfig({
                    ...tempBufferConfig,
                    warnThreshold: parseInt(e.target.value) || 100
                  })}
                  min='10'
                  max='1000'
                />
              </div>
              <div>
                <label className='db fw6 mb1 f6'>{t('logs.config.autoDisableThreshold')}</label>
                <input
                  type='number'
                  className='input-reset ba b--black-20 pa2 w-100'
                  value={tempBufferConfig.autoDisableThreshold}
                  onChange={(e) => setTempBufferConfig({
                    ...tempBufferConfig,
                    autoDisableThreshold: parseInt(e.target.value) || 500
                  })}
                  min='50'
                  max='2000'
                />
              </div>
            </div>
            <div className='flex justify-end gap2'>
              <Button className='bg-gray white' onClick={() => setShowBufferConfig(false)}>
                {t('logs.config.cancel')}
              </Button>
              <Button className='bg-green white' onClick={applyBufferConfig}>
                {t('logs.config.apply')}
              </Button>
            </div>
          </div>
        )}
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
        <h3 className='montserrat fw4 charcoal ma0 f5 mb3'>
          Log Entries ({safeLogEntries.length})
          {logStorageStats && logStorageStats.totalEntries > safeLogEntries.length && (
            <span className='charcoal-muted f6 fw4 ml2'>
              ({(logStorageStats.totalEntries - safeLogEntries.length).toLocaleString()} more in history)
            </span>
          )}
        </h3>

        <div
          ref={logContainerRef}
          className='ba b--black-20 pa2 bg-near-white f6 overflow-auto relative'
          style={{ height: '400px', fontFamily: 'Monaco, Consolas, monospace' }}
          onScroll={handleScroll}
        >
          {/* Load More History Button/Indicator */}
          {hasMoreHistory && (
            <div className='sticky top-0 bg-light-yellow pa2 mb2 tc br2 f6'>
              {isLoadingHistory
                ? (
                <span className='charcoal-muted'>
                  🔄 {t('logs.entries.loadingHistory')}...
                </span>
                  )
                : (
                <Button
                  className='bg-blue white f6 pa1'
                  onClick={handleScrollToTop}
                >
                  {t('logs.entries.loadMore')}
                </Button>
                  )}
            </div>
          )}

          {safeLogEntries.length === 0
            ? (
            <p className='gray tc pa3'>{t('logs.entries.noEntries')}</p>
              )
            : (
            <div>
              {safeLogEntries.map((entry, index) => (
                <div key={entry.id || index} className='flex mb1 lh-copy hover-bg-light-gray pa1 br1'>
                  <span className='w3 mr2 gray truncate f7' title={entry.timestamp}>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span
                    className='w3 mr2 fw6 truncate f7'
                    style={{ color: getLevelColor(entry.level) }}
                  >
                    {entry.level.toUpperCase()}
                  </span>
                  <span className='w4 mr2 blue truncate f7' title={entry.subsystem}>
                    {entry.subsystem}
                  </span>
                  <span className='flex-auto f7 pre-wrap'>
                    {entry.message}
                  </span>
                </div>
              ))}

              {/* Auto-scroll to bottom indicator */}
              {isLogStreaming && !isAtTop && (
                <div className='tc pa2 charcoal-muted f6'>
                  📍 {t('logs.entries.streaming')}
                </div>
              )}
            </div>
              )}
        </div>
      </Box>

      {/* Warning Modal */}
      <LogWarningModal
        isOpen={warningModal.isOpen}
        warningType={warningModal.type}
        currentRate={logRateState.currentRate}
        onClose={() => setWarningModal({ isOpen: false, type: null })}
        onConfirm={confirmLevelChange}
      />
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
  'selectLogBufferConfig',
  'selectLogRateState',
  'selectHasMoreHistory',
  'selectIsLoadingHistory',
  'selectLogStorageStats',
  'doFetchLogSubsystems',
  'doSetLogLevel',
  'doStartLogStreaming',
  'doStopLogStreaming',
  'doClearLogEntries',
  'doUpdateLogBufferConfig',
  'doLoadHistoricalLogs',
  'doUpdateStorageStats',
  'doShowLogWarning',
  'doAutoDisableStreaming'
)
