import React, { useEffect, useState, useRef } from 'react'
import Box from '../../components/box/Box.js'
import LogWarningModal from './log-warning-modal'
import { useLogs } from '../../contexts/logs/index'
import GologLevelSection from './golog-level-section'
import UnsupportedKuboVersion from '../../components/unsupported-kubo-version/unsupported-kubo-version'
import type { WarningModalTypes } from './log-warning-modal'
import { LogViewer } from './log-viewer'
import { LogScreenFooter } from './log-screen-footer'
import './logs-screen.css'

const LogsScreen = () => {
  const {
    entries: safeLogEntries,
    isStreaming: isLogStreaming,
    bufferConfig: logBufferConfig,
    rateState: logRateState,
    setLogLevelsBatch: doSetLogLevelsBatch,
    startStreaming: doStartLogStreaming,
    stopStreaming: doStopLogStreaming,
    clearEntries: doClearEntries,
    showWarning: doShowWarning,
    isAgentVersionSupported
  } = useLogs()

  // Component state
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean, type: WarningModalTypes }>({ isOpen: false, type: null })
  const [pendingLevelChange, setPendingLevelChange] = useState<{ subsystem: string, level: string } | null>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

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
      }
    }
  }

  // Show unsupported version message if log levels are not supported
  if (!isAgentVersionSupported) {
    return (
      <UnsupportedKuboVersion />
    )
  }

  return (
    <div className='logs-screen-container'>
      <GologLevelSection />

      <Box className='' style={{ flex: '1 1 auto', minHeight: '15rem', display: 'flex', flexDirection: 'column' }}>
        <LogViewer
          logEntries={safeLogEntries}
          isStreaming={isLogStreaming}
          containerRef={logContainerRef}
          startStreaming={doStartLogStreaming}
          stopStreaming={doStopLogStreaming}
          clearEntries={doClearEntries}
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
