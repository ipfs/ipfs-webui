import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../../components/box/Box.js'
import Button from '../../components/button/button'
import LogWarningModal from './log-warning-modal'
import { humanSize } from '../../lib/files.js'
import { useLogs } from '../../contexts/logs/index'
import { StreamingStatus } from './streaming-status'
import GologLevelSection from './golog-level-section'
import type { WarningModalTypes } from './log-warning-modal'

type LogLevelColor = 'gray' | 'blue' | 'orange' | 'red' | 'darkred' | 'black'

const getLevelColor = (level: string): LogLevelColor => {
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

const formatTimestamp = (timestamp: string): string => {
  try {
    return new Date(timestamp).toLocaleTimeString()
  } catch {
    return timestamp
  }
}

const LogsScreen = () => {
  const { t } = useTranslation('diagnostics')
  const {
    entries: logEntries,
    isStreaming: isLogStreaming,
    bufferConfig: logBufferConfig,
    rateState: logRateState,
    storageStats: logStorageStats,
    setLogLevelsBatch: doSetLogLevelsBatch,
    startStreaming: doStartLogStreaming,
    stopStreaming: doStopLogStreaming,
    clearEntries: doClearLogEntries,
    updateBufferConfig: doUpdateLogBufferConfig,
    showWarning: doShowWarning
  } = useLogs()

  // Component state
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean, type: WarningModalTypes }>({ isOpen: false, type: null })
  const [pendingLevelChange, setPendingLevelChange] = useState<{ subsystem: string, level: string } | null>(null)
  const [showBufferConfig, setShowBufferConfig] = useState(false)
  const [tempBufferConfig, setTempBufferConfig] = useState({ ...logBufferConfig, selectedSubsystem: '' })

  // Refs for virtual scrolling
  const logContainerRef = useRef<HTMLDivElement>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  // Ensure we have safe defaults for arrays
  const safeLogEntries = useMemo(() => Array.isArray(logEntries) ? logEntries : [], [logEntries])

  // Monitor for warnings and auto-disable
  useEffect(() => {
    if (logRateState.currentRate > logBufferConfig.warnThreshold &&
        !logRateState.hasWarned &&
        !logRateState.autoDisabled &&
        isLogStreaming) {
      setWarningModal({ isOpen: true, type: 'high-rate' })
      // Mark that warning has been shown to prevent it from showing again
      doShowWarning()
    }
  }, [logRateState, logBufferConfig, isLogStreaming, doShowWarning])

  useEffect(() => {
    if (logRateState.autoDisabled) {
      setWarningModal({ isOpen: true, type: 'auto-disable' })
    }
  }, [logRateState.autoDisabled])

  // Update temp config when buffer config changes
  useEffect(() => {
    setTempBufferConfig({ ...logBufferConfig, selectedSubsystem: '' })
  }, [logBufferConfig])

  // Auto-scroll to bottom when new logs arrive during streaming OR when initially loaded
  useEffect(() => {
    if (logContainerRef.current == null) return
    if (!autoScrollEnabled) return
    if (safeLogEntries.length === 0) return
    const container = logContainerRef.current
    // Small delay to ensure DOM has updated with new content
    setTimeout(() => {
      container.scrollTop = container.scrollHeight
    }, 10)
  }, [safeLogEntries.length, isLogStreaming, autoScrollEnabled])

  // Scroll to bottom when logs are initially loaded on page load
  useEffect(() => {
    if (safeLogEntries.length > 0 && logContainerRef.current) {
      const container = logContainerRef.current
      // Longer delay to ensure all rendering is complete
      setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 200)
    }
  }, [safeLogEntries.length]) // Trigger when entries change and loading is complete

  const confirmLevelChange = async () => {
    if (pendingLevelChange) {
      try {
        await doSetLogLevelsBatch([{
          subsystem: pendingLevelChange.subsystem,
          level: pendingLevelChange.level
        }])
        setPendingLevelChange(null)
      } catch (error) {
        console.error('Failed to set log level:', error)
        // Optionally show error to user
      }
    }
  }

  // Monitor scroll position for auto-scroll only
  const handleScroll = useCallback((e) => {
    e.stopPropagation() // Prevent scroll from bubbling to parent
    const container = e.target
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50

    // Enable auto-scroll when user scrolls to bottom
    if (isNearBottom && !autoScrollEnabled) {
      setAutoScrollEnabled(true)
    }

    // Disable auto-scroll when user scrolls away from bottom
    if (!isNearBottom && autoScrollEnabled) {
      setAutoScrollEnabled(false)
    }
  }, [autoScrollEnabled])

  const applyBufferConfig = () => {
    doUpdateLogBufferConfig(tempBufferConfig)
    setShowBufferConfig(false)
  }

  const getLogRangeDisplay = () => {
    if (!logStorageStats || safeLogEntries.length === 0) {
      return t('logs.storage.logEntriesCount', { count: safeLogEntries.length })
    }

    const totalEntries = logStorageStats.totalEntries
    const currentCount = safeLogEntries.length

    // Always showing latest logs since there's no infinite scroll
    const rangeStart = Math.max(1, totalEntries - currentCount + 1)
    const rangeEnd = totalEntries

    return t('logs.storage.logEntriesRange', {
      total: totalEntries.toLocaleString(),
      start: rangeStart.toLocaleString(),
      end: rangeEnd.toLocaleString()
    })
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
            <StreamingStatus
              isLogStreaming={isLogStreaming}
              logRateState={logRateState}
              logBufferConfig={logBufferConfig}
            />
          </div>
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

      {/* GOLOG Level Display / Edit */}
      <GologLevelSection />

      {/* Log Entries */}
      <Box className='mb3' style={{}}>
        <div className='flex items-center justify-between mb3'>
          <div className='flex items-center'>
            <h3 className='montserrat fw4 charcoal ma0 f5'>
              {getLogRangeDisplay()}
            </h3>
            {isLogStreaming && !autoScrollEnabled && (
              <span className='ml2 f6 pa1 br2 bg-light-gray charcoal-muted'>
                {t('logs.entries.autoScrollPaused')}
              </span>
            )}
          </div>

          {/* Navigation Controls */}
          <div className='flex gap2'>
            <Button
              className='bg-green white f6 pa2'
              onClick={() => {
                if (logContainerRef.current) {
                  logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
                }
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
          className='ba b--black-20 pa2 bg-near-white f6 overflow-auto overflow-x-hidden relative'
          style={{ height: '400px', fontFamily: 'Monaco, Consolas, monospace' }}
          onScroll={handleScroll}
        >
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
              {isLogStreaming && autoScrollEnabled && (
                <div className='tc pa2 charcoal-muted f6'>
                  {t('logs.entries.streaming')}
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
            {/* @ts-expect-error - humanSize is not typed properly */}
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
