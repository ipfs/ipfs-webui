import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../box/Box.js'
import Button from '../button/button.js'
import VirtualLogsViewer from './virtual-logs-viewer'
import { useLogs } from '../../contexts/logs'

const LogsScreenVirtual: React.FC = () => {
  const { t } = useTranslation('diagnostics')
  const {
    isStreaming: isLogStreaming,
    rateState: logRateState,
    bufferConfig: logBufferConfig,
    storageStats: logStorageStats,
    viewOffset: logViewOffset,
    startStreaming: doStartLogStreaming,
    stopStreaming: doStopLogStreaming,
    clearEntries: doClearLogEntries,
    goToLatestLogs: doGoToLatestLogs
  } = useLogs()

  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  const getLevelColor = useCallback((level: string) => {
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
  }, [])

  const formatTimestamp = useCallback((timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString()
    } catch {
      return timestamp
    }
  }, [])

  const getLogRangeDisplay = () => {
    if (!logStorageStats) {
      return t('logs.storage.logEntriesCount', { count: 0 })
    }

    const totalEntries = logStorageStats.totalEntries

    if (logViewOffset === 0) {
      return t('logs.storage.logEntriesRange', {
        total: totalEntries.toLocaleString(),
        start: Math.max(1, totalEntries - 1000 + 1).toLocaleString(),
        end: totalEntries.toLocaleString()
      })
    } else {
      const rangeEnd = totalEntries - logViewOffset
      const rangeStart = Math.max(1, rangeEnd - 1000 + 1)

      return t('logs.storage.logEntriesRange', {
        total: totalEntries.toLocaleString(),
        start: rangeStart.toLocaleString(),
        end: rangeEnd.toLocaleString()
      })
    }
  }

  return (
    <div>
      <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('logs.title')} (Virtualized)</h2>

      {/* Rate Monitoring & Status */}
      <Box className='mb3'>
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
          </div>
        </div>
      </Box>

      {/* Log Entries with Virtualization */}
      <Box className='mb3'>
        <div className='flex items-center justify-between mb3'>
          <h3 className='montserrat fw4 charcoal ma0 f5'>
            {getLogRangeDisplay()}
          </h3>
          <div className='flex gap2'>
            {logViewOffset > 0 && (
              <Button
                className='bg-blue white f6'
                onClick={doGoToLatestLogs}
                title={t('logs.entries.goToLatest')}
              >
                📍 {t('logs.entries.goToLatest')}
              </Button>
            )}
            <Button
              className={`f6 ${autoScrollEnabled ? 'bg-green white' : 'bg-gray white'}`}
              onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
              title="Toggle auto-scroll"
            >
              {autoScrollEnabled ? '⏸️ Pause' : '▶️ Resume'} Auto-scroll
            </Button>
          </div>
        </div>

        <VirtualLogsViewer
          height={600}
          formatTimestamp={formatTimestamp}
          getLevelColor={getLevelColor}
          autoScrollEnabled={autoScrollEnabled}
          isStreaming={isLogStreaming}
          viewOffset={logViewOffset}
        />
      </Box>
    </div>
  )
}

export default LogsScreenVirtual
