import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { LogViewer } from './log-viewer'
import { LogsProvider } from '../../contexts/logs'
import type { LogEntry } from '../../contexts/logs/api'
import { IdentityProvider } from '../../contexts/identity-context'

const meta: Meta<typeof LogViewer> = {
  title: 'Diagnostics/Logs/LogViewer',
  component: LogViewer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A log viewer component that displays log entries with streaming capabilities and performance testing.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Mock log entry generator
const generateMockLogEntry = (index: number, timestamp: Date): LogEntry => {
  const levels = ['debug', 'info', 'warn', 'error'] as const
  const subsystems = ['ipfs', 'libp2p', 'bitswap', 'dht', 'repo', 'blockstore'] as const

  const level = levels[index % levels.length]
  const subsystem = subsystems[index % subsystems.length]

  return {
    id: `mock-${index}`,
    timestamp: timestamp.toISOString(),
    level,
    subsystem,
    message: `Mock log entry ${index} from ${subsystem} subsystem with ${level} level - this is a longer message to test text wrapping and display performance under load.`
  }
}

// Performance test component wrapper
const LogViewerPerformanceTest: React.FC<{
  logsPerSecond: number
  testDuration: number,
  initialLogCount?: number
}> = ({ logsPerSecond, testDuration, initialLogCount = 0 }) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [testStats, setTestStats] = useState({
    totalLogs: 0,
    startTime: 0,
    currentRate: 0,
    isComplete: false
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const testStartTimeRef = useRef<number>(0)
  const logCountRef = useRef(0)
  const currentRateCountRef = useRef(0)

  const logGenInterval = 100

  useEffect(() => {
    if (initialLogCount > 0) {
      setLogEntries(Array.from({ length: initialLogCount }, (_, i) => generateMockLogEntry(i, new Date())))
    }
  }, [initialLogCount])

  // Generate logs at specified rate
  const generateLogs = useCallback(() => {
    // this is called every <logGenInterval>ms no matter what, we need to figure out how many logs to generate based on the logsPerSecond
    const logsToGenerate = Math.floor(logsPerSecond / (1000 / logGenInterval))
    const now = new Date()

    setLogEntries(prev => {
      const updated = [...prev, ...Array.from({ length: logsToGenerate }, () => generateMockLogEntry(logCountRef.current++, now))]
      // Keep only last 1000 entries in memory for performance
      return updated.slice(-1000)
    })
    setTestStats(prev => ({
      ...prev,
      isComplete: false,
      totalLogs: logCountRef.current
    }))
  }, [logsPerSecond])

  // Start performance test
  const startTest = useCallback(() => {
    setIsStreaming(true)
    setTestStats(prev => ({ ...prev, startTime: Date.now(), isComplete: false }))
    testStartTimeRef.current = Date.now()
    currentRateCountRef.current = logCountRef.current

    // Start generating logs at specified rate
    const interval = setInterval(() => {
      generateLogs()
    }, logGenInterval)

    intervalRef.current = interval

    // Stop test after duration
    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsStreaming(false)
      setTestStats(prev => ({
        ...prev,
        isComplete: true,
        totalLogs: logCountRef.current
      }))
    }, testDuration * 1000)
  }, [testDuration, generateLogs, logGenInterval])

  // Stop test
  const stopTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsStreaming(false)
  }, [])

  // Update test stats
  useEffect(() => {
    if (!isStreaming) return

    const updateStats = () => {
      const elapsed = (Date.now() - testStartTimeRef.current) / 1000
      const currentRate = elapsed > 0 ? (logCountRef.current - currentRateCountRef.current) / elapsed : 0

      setTestStats(prev => ({
        ...prev,
        currentRate: Math.round(currentRate * 100) / 100
      }))
    }

    const statsInterval = setInterval(updateStats, 100)
    return () => clearInterval(statsInterval)
  }, [isStreaming])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="w-100">
      {/* Test Controls */}
      <div className="mb4 pa3 bg-light-gray br2">
        <h3 className="mt0 mb3">Performance Test Controls</h3>
        <div className="flex flex-wrap items-center" style={{ gap: '1rem' }}>
          <div>
            <span className="db mb1 f6 fw6">Logs per Second:</span>
            <span className="f4 fw4">{logsPerSecond}</span>
          </div>
          <div>
            <span className="db mb1 f6 fw6">Test Duration:</span>
            <span className="f4 fw4">{testDuration}s</span>
          </div>
          <div>
            <span className="db mb1 f6 fw6">Current Rate:</span>
            <span className="f4 fw4">{testStats.currentRate}/s</span>
          </div>
          <div>
            <span className="db mb1 f6 fw6">Total Logs:</span>
            <span className="f4 fw4">{testStats.totalLogs}</span>
          </div>
        </div>

        {testStats.isComplete && (
          <div className="mt3 pa2 bg-green white br2">
            <strong>Test Complete!</strong> Generated {logCountRef.current - currentRateCountRef.current} logs over {testDuration} seconds.
            Average rate: {Math.round((logCountRef.current - currentRateCountRef.current) / testDuration)} logs/second.
          </div>
        )}
      </div>

      <IdentityProvider>
        <LogsProvider>
          <LogViewer
            logEntries={logEntries}
            isStreaming={isStreaming}
            containerRef={containerRef}
            startStreaming={startTest}
            stopStreaming={stopTest}
          />
        </LogsProvider>
      </IdentityProvider>
    </div>
  )
}

// Default story
export const Default: Story = {
  render: () => <LogViewerPerformanceTest logsPerSecond={10} testDuration={10} />
}

// High volume test story
export const HighVolumeTest: Story = {
  render: () => <LogViewerPerformanceTest logsPerSecond={100} testDuration={15} />,
  parameters: {
    docs: {
      description: {
        story: 'Test the log viewer with high volume (100 logs/second) to verify performance under load.'
      }
    }
  }
}

// Stress test story
export const StressTest: Story = {
  render: () => <LogViewerPerformanceTest logsPerSecond={500} testDuration={20} />,
  parameters: {
    docs: {
      description: {
        story: 'Stress test with very high volume (500 logs/second) to identify performance bottlenecks.'
      }
    }
  }
}

// any existing logs should load on initial render, and we should be scrolled to the bottom.
export const LoadExistingLogs: Story = {
  render: () => <LogViewerPerformanceTest logsPerSecond={20} testDuration={5} initialLogCount={100} />,
  parameters: {
    docs: {
      description: {
        story: 'Test the log viewer with no logs to verify that existing logs load on initial render.'
      }
    }
  }
}
