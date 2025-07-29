import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../components/box/Box.js'
import Button from '../components/button/button.jsx'
import LogWarningModal from '../components/log-warning-modal.tsx'
import { humanSize } from '../lib/files.js'
import { useLogs } from '../contexts/logs/index'

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal']

const LogsScreen = () => {
  const { t } = useTranslation('diagnostics')
  const {
    entries: logEntries,
    subsystems: logSubsystems,
    isStreaming: isLogStreaming,
    globalLogLevel,
    isLoadingSubsystems,
    bufferConfig: logBufferConfig,
    rateState: logRateState,
    hasMoreHistory,
    isLoadingHistory,
    storageStats: logStorageStats,
    viewOffset: logViewOffset,
    subsystemLevels,
    actualLogLevels,
    isLoadingLevels,
    fetchSubsystems: doFetchLogSubsystems,
    fetchLogLevels: doFetchLogLevels,
    setLogLevel: doSetLogLevel,
    startStreaming: doStartLogStreaming,
    stopStreaming: doStopLogStreaming,
    clearEntries: doClearLogEntries,
    updateBufferConfig: doUpdateLogBufferConfig,
    loadHistoricalLogs: doLoadHistoricalLogs,
    updateStorageStats: doUpdateStorageStats,
    goToLatestLogs: doGoToLatestLogs
  } = useLogs()

  // Component state
  const [warningModal, setWarningModal] = useState({ isOpen: false, type: null })
  const [pendingLevelChange, setPendingLevelChange] = useState(null)
  const [showBufferConfig, setShowBufferConfig] = useState(false)
  const [tempBufferConfig, setTempBufferConfig] = useState({ ...logBufferConfig, selectedSubsystem: '' })

  // Refs for virtual scrolling
  const logContainerRef = useRef(null)
  const [isAtTop, setIsAtTop] = useState(false)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  // Ensure we have safe defaults for arrays
  const safeLogEntries = useMemo(() => Array.isArray(logEntries) ? logEntries : [], [logEntries])
  const safeLogSubsystems = useMemo(() => {
    const subsystems = Array.isArray(logSubsystems) ? logSubsystems : []

    // Merge with actual log levels from API, fallback to session tracking
    const mergedSubsystems = subsystems.map(subsystem => ({
      ...subsystem,
      level: actualLogLevels[subsystem.name] || subsystemLevels[subsystem.name] || subsystem.level || 'info'
    }))
    return mergedSubsystems
  }, [logSubsystems, subsystemLevels, actualLogLevels])

  useEffect(() => {
    doFetchLogSubsystems()
    doFetchLogLevels()
    doUpdateStorageStats()
    // Load initial logs from history on page load
    doGoToLatestLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

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
    setTempBufferConfig({ ...logBufferConfig, selectedSubsystem: '' })
  }, [logBufferConfig])

  // Handle scroll position after loading historical logs
  useEffect(() => {
    if (!isLoadingHistory && logContainerRef.current && safeLogEntries.length > 0) {
      // After historical logs are loaded, scroll to a position that shows continuity
      // This ensures smooth infinite scroll experience
      const container = logContainerRef.current
      const shouldAutoScroll = container.scrollTop < 100 // Only if user was near top

      if (shouldAutoScroll) {
        // Scroll down a bit from the top to show some of the newly loaded content
        // but not so much that it feels jarring
        setTimeout(() => {
          container.scrollTop = 150 // Show some historical logs but not overwhelm
        }, 50)
      }
    }
  }, [isLoadingHistory, safeLogEntries.length])

  // Disable auto-scroll when viewing historical logs, enable when at latest
  useEffect(() => {
    if (logViewOffset > 0) {
      setAutoScrollEnabled(false)
    } else {
      // When returning to latest logs, enable auto-scroll
      setAutoScrollEnabled(true)
    }
  }, [logViewOffset])

  // Auto-scroll to bottom when new logs arrive during streaming
  useEffect(() => {
    const shouldAutoScroll = isLogStreaming && autoScrollEnabled && logViewOffset === 0 && logContainerRef.current && safeLogEntries.length > 0

    if (shouldAutoScroll) {
      const container = logContainerRef.current
      // Small delay to ensure DOM has updated with new content
      setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 10)
    }
  }, [safeLogEntries.length, isLogStreaming, autoScrollEnabled, logViewOffset])

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

  const handleGoToTop = useCallback(() => {
    const container = logContainerRef.current
    if (!container) return

    const isNearTop = container.scrollTop < 50

    // If already at top and there's more history, load more
    if (isNearTop && hasMoreHistory && !isLoadingHistory) {
      handleScrollToTop()
    } else {
      // Otherwise just scroll to top
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [hasMoreHistory, isLoadingHistory, handleScrollToTop])

  // Monitor scroll position for infinite scroll and auto-scroll
  const handleScroll = useCallback((e) => {
    e.stopPropagation() // Prevent scroll from bubbling to parent
    const container = e.target
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    const isNearTop = scrollTop < 50
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50

    setIsAtTop(isNearTop)

    // Only manage auto-scroll when we're at the latest logs (not historical view)
    if (logViewOffset === 0) {
      // Enable auto-scroll when user scrolls to bottom
      if (isNearBottom && !autoScrollEnabled) {
        setAutoScrollEnabled(true)
      }

      // Disable auto-scroll when user scrolls away from bottom
      if (!isNearBottom && autoScrollEnabled) {
        setAutoScrollEnabled(false)
      }
    }

    if (isNearTop && hasMoreHistory && !isLoadingHistory) {
      handleScrollToTop()
    }
  }, [hasMoreHistory, isLoadingHistory, handleScrollToTop, autoScrollEnabled, logViewOffset])

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

  const getLogRangeDisplay = () => {
    if (!logStorageStats || safeLogEntries.length === 0) {
      return `Log Entries (${safeLogEntries.length})`
    }

    const totalEntries = logStorageStats.totalEntries
    const currentCount = safeLogEntries.length

    if (logViewOffset === 0) {
      // Showing latest logs
      const rangeStart = Math.max(1, totalEntries - currentCount + 1)
      const rangeEnd = totalEntries

      return `Log Entries (${currentCount}) (showing ${rangeStart.toLocaleString()}-${rangeEnd.toLocaleString()} of ${totalEntries.toLocaleString()})`
    } else {
      // Showing historical logs - the range is based on our position in history
      const rangeEnd = totalEntries - logViewOffset
      const rangeStart = Math.max(1, rangeEnd - currentCount + 1)

      return `Log Entries (${currentCount}) (showing ${rangeStart.toLocaleString()}-${rangeEnd.toLocaleString()} of ${totalEntries.toLocaleString()})`
    }
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
              {isLogStreaming ? t('logs.streaming.statusActive') : t('logs.streaming.statusStopped')}
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
        <div className='flex gap4'>
          {/* Global Log Level */}
          <div className='flex-auto'>
            <label className='db fw6 mb2'>{t('logs.levels.global')}</label>
            <select
              className='input-reset ba b--black-20 pa2 w-100'
              value={actualLogLevels['*'] || globalLogLevel}
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
          <div className='flex-auto'>
            <label className='db fw6 mb2'>{t('logs.levels.subsystem')}</label>
            {isLoadingSubsystems || isLoadingLevels
              ? (
              <p className='gray'>{t('logs.entries.loading')}</p>
                )
              : (
              <div className='flex items-end gap2'>
                <div className='flex-auto'>
                  <select
                    className='input-reset ba b--black-20 pa2 w-100'
                    value={tempBufferConfig.selectedSubsystem || ''}
                    onChange={(e) => {
                      const selectedSubsystem = e.target.value
                      setTempBufferConfig({
                        ...tempBufferConfig,
                        selectedSubsystem
                      })
                    }}
                  >
                    <option value=''>{t('logs.levels.selectSubsystem')}</option>
                    {safeLogSubsystems.map(subsystem => (
                      <option key={subsystem.name} value={subsystem.name}>
                        {subsystem.name}
                      </option>
                    ))}
                  </select>
                </div>
                {tempBufferConfig.selectedSubsystem && (
                  <div className='flex-none'>
                    <select
                      className='input-reset ba b--black-20 pa2'
                      value={safeLogSubsystems.find(s => s.name === tempBufferConfig.selectedSubsystem)?.level || 'info'}
                      onChange={(e) => handleLevelChange(tempBufferConfig.selectedSubsystem, e.target.value)}
                    >
                      {LOG_LEVELS.map(level => (
                        <option key={level} value={level}>
                          {t(`logs.levels.${level}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
                )}
            {tempBufferConfig.selectedSubsystem && (
              <div className='mt2 charcoal-muted f6'>
                {t('logs.levels.currentLevel')}: {safeLogSubsystems.find(s => s.name === tempBufferConfig.selectedSubsystem)?.level || 'info'}
              </div>
            )}
          </div>
        </div>
      </Box>

      {/* Log Entries */}
      <Box className='mb3' style={{}}>
        <div className='flex items-center justify-between mb3'>
          <div className='flex items-center'>
            <h3 className='montserrat fw4 charcoal ma0 f5'>
              {getLogRangeDisplay()}
            </h3>
            {logViewOffset > 0 && (
              <span className='ml2 f6 pa1 br2 bg-light-yellow charcoal-muted'>
                {t('logs.entries.historicalView')}
              </span>
            )}
            {logViewOffset > 0 && isLogStreaming && (
              <span className='ml2 f6 pa1 br2 bg-light-blue charcoal-muted'>
                {t('logs.entries.newLogsArriving')}
              </span>
            )}
            {isLogStreaming && !autoScrollEnabled && logViewOffset === 0 && (
              <span className='ml2 f6 pa1 br2 bg-light-gray charcoal-muted'>
                {t('logs.entries.autoScrollPaused')}
              </span>
            )}
          </div>

          {/* Navigation Controls */}
          <div className='flex gap2'>
            <Button
              className='bg-blue white f6 pa2'
              onClick={handleGoToTop}
              disabled={safeLogEntries.length === 0}
              title={hasMoreHistory && isAtTop ? t('logs.entries.tooltipLoadMore') : t('logs.entries.tooltipGoToTop')}
            >
              {hasMoreHistory && isAtTop ? t('logs.entries.loadMoreHistory') : t('logs.entries.goToTop')}
            </Button>

            <Button
              className='bg-green white f6 pa2'
              onClick={() => {
                doGoToLatestLogs()
                setAutoScrollEnabled(true) // Re-enable auto-scroll when going to latest
              }}
              disabled={safeLogEntries.length === 0}
              title={t('logs.entries.tooltipGoToLatest')}
            >
              {t('logs.entries.goToLatest')}
            </Button>
          </div>
        </div>

        <div
          ref={logContainerRef}
          className='ba b--black-20 pa2 bg-near-white f6 overflow-auto relative'
          style={{ height: '400px', fontFamily: 'Monaco, Consolas, monospace' }}
          onScroll={handleScroll}
        >
          {/* Loading indicator when fetching historical logs */}
          {isLoadingHistory && (
            <div className='sticky top-0 bg-light-yellow pa2 mb2 tc br2 f6'>
              <span className='charcoal-muted'>
                🔄 {t('logs.entries.loadingHistory')}...
              </span>
            </div>
          )}

          {safeLogEntries.length === 0
            ? <p className='gray tc pa3'>{t('logs.entries.noEntries')}</p>
            : <div>
              {safeLogEntries.map((entry, index) => (
                <div key={`${entry.timestamp}-${entry.subsystem}-${index}`} className='flex mb1 lh-copy hover-bg-light-gray pa1 br1'>
                  <span className='flex-none mr2 gray f7' style={{ minWidth: '90px' }} title={entry.timestamp}>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span
                    className='flex-none mr2 fw6 f7'
                    style={{ minWidth: '60px', color: getLevelColor(entry.level) }}
                  >
                    {entry.level.toUpperCase()}
                  </span>
                  <span className='flex-none mr2 blue f7' style={{ minWidth: '120px' }} title={entry.subsystem}>
                    {entry.subsystem}
                  </span>
                  <span className='flex-auto f7 pre-wrap'>
                    {entry.message}
                  </span>
                </div>
              ))}

              {/* Auto-scroll to bottom indicator */}
              {isLogStreaming && logViewOffset === 0 && autoScrollEnabled && (
                <div className='tc pa2 charcoal-muted f6'>
                  📍 {t('logs.entries.streaming')}
                </div>
              )}
            </div>}
        </div>
      </Box>

      {/* Storage Stats */}
      {logStorageStats && (
        <div className='bt b--black-20 pt3'>
          <h4 className='montserrat fw6 charcoal ma0 f6 mb2'>{t('logs.storage.title')}</h4>
          <div className='flex items-center charcoal-muted f6'>
            <span className='mr3'>{t('logs.storage.totalEntries')}: {logStorageStats.totalEntries.toLocaleString()}</span>
            <span className='mr3'>{t('logs.storage.estimatedSize')}: {humanSize(logStorageStats.estimatedSize)}</span>
            <span>{t('logs.storage.memoryBuffer')}: {safeLogEntries.length}/{logBufferConfig.memory}</span>
          </div>
        </div>
      )}

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

export default LogsScreen
