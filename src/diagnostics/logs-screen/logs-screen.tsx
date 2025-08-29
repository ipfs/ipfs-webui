import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '../../components/box/Box.js'
import LogWarningModal from './log-warning-modal'
import { useLogs } from '../../contexts/logs/index'
import GologLevelSection from './golog-level-section'
import UnsupportedKuboVersion from '../../components/unsupported-kubo-version/unsupported-kubo-version'
import type { WarningModalTypes } from './log-warning-modal'
import { useAgentVersionMinimum } from '../../lib/hooks/use-agent-version-minimum'
import { LogViewer } from './log-viewer'
import { LogScreenFooter } from './log-screen-footer'

const LogsScreen = () => {
  const { t } = useTranslation('diagnostics')
  const {
    entries: safeLogEntries,
    isStreaming: isLogStreaming,
    bufferConfig: logBufferConfig,
    rateState: logRateState,
    // storageStats: logStorageStats,
    setLogLevelsBatch: doSetLogLevelsBatch,
    startStreaming: doStartLogStreaming,
    stopStreaming: doStopLogStreaming,
    showWarning: doShowWarning
  } = useLogs()

  // Component state
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean, type: WarningModalTypes }>({ isOpen: false, type: null })
  const [pendingLevelChange, setPendingLevelChange] = useState<{ subsystem: string, level: string } | null>(null)

  // Refs for virtual scrolling
  const logContainerRef = useRef<HTMLDivElement>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

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

  /**
   * Kubo only adds support for getting log levels in version 0.37.0 and later.
   *
   * Kubo fixed log tailing in version 0.36.0 and later.
   * @see https://github.com/ipfs/kubo/issues/10867
   */
  const { ok: isAgentVersionSupported } = useAgentVersionMinimum({
    minimumVersion: '0.37.0',
    requiredAgent: 'kubo'
  })

  // Show unsupported version message if log levels are not supported
  if (!isAgentVersionSupported) {
    return (
      <UnsupportedKuboVersion />
    )
  }

  return (
    <div>
      {/* <h2 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('logs.title')}</h2> */}
      <p className='charcoal-muted mb4'>{t('logs.description')}</p>

      <GologLevelSection />

      <Box className=''>
        <LogViewer
          logEntries={safeLogEntries}
          isStreaming={isLogStreaming}
          // autoScrollEnabled={autoScrollEnabled}
          containerRef={logContainerRef}
          onScroll={handleScroll}
          startStreaming={doStartLogStreaming}
          stopStreaming={doStopLogStreaming}
        />
      </Box>

      <LogScreenFooter />

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
