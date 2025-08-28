import React, { type CSSProperties, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from '../../components/tooltip/Tooltip'
import { GlyphShrink, GlyphExpand, GlyphPlay, GlyphPause, GlyphMoveDown, GlyphSettings } from '../../icons/all'
import './log-viewer.css'
import type { LogEntry as LogEntryType } from '../../contexts/logs/api'

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

interface TopControlsProps {
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
  isStreaming: boolean
  startStreaming: () => void
  stopStreaming: () => void
}

const TopControls: React.FC<TopControlsProps> = ({ isExpanded, setIsExpanded, isStreaming, startStreaming, stopStreaming }) => {
  const { t } = useTranslation('diagnostics')

  const SizeControl = useMemo(() => {
    if (!isExpanded) {
      return GlyphExpand
    }
    return GlyphShrink
  }, [isExpanded])

  const PlayPauseControl = useMemo(() => {
    if (isStreaming) {
      return GlyphPause
    }
    return GlyphPlay
  }, [isStreaming])

  const toggleStreaming = useCallback(() => {
    if (isStreaming) {
      stopStreaming()
    } else {
      startStreaming()
    }
  }, [isStreaming, startStreaming, stopStreaming])

  // because the settings icon is from ipfs-css and the others are from lucide, we need to adjust a little bit to make it look the same
  const settingsIconStyle = { transformBox: 'fill-box', transformOrigin: 'center', transform: 'scale(1.50)' } as const

  return (
    <div className='absolute top-1 right-0 mr4 z-10 flex flex-column flex-start items-end'>
      {/* Streaming controls */}
      {/* <div className='flex flex-row' style={{ gap: '0.5rem' }}> */}

        <Tooltip text={isExpanded ? t('logs.entries.tooltipCollapse') : t('logs.entries.tooltipExpand')}>
          <SizeControl width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black mb1' onClick={() => setIsExpanded(!isExpanded)} />
        </Tooltip>
      {/* </div> */}
      {/* Settings */}
      <Tooltip text={t('logs.entries.tooltipSettings')}>
        <GlyphSettings width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black mb1 fill-current-color' style={settingsIconStyle} />
      </Tooltip>
      <Tooltip text={isStreaming ? t('logs.entries.tooltipPause') : t('logs.entries.tooltipPlay')}>
        <PlayPauseControl width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black' onClick={toggleStreaming} />
      </Tooltip>
  </div>
  )
}

interface BottomControlsProps {
  isAtBottom: boolean
  scrollToBottom: () => void
}

const BottomControls: React.FC<BottomControlsProps> = ({ isAtBottom, scrollToBottom }) => {
  const { t } = useTranslation('diagnostics')

  if (isAtBottom) {
    return null
  }

  return <div className='absolute bottom-1 right-0 mr4 z-10 flex flex-row' style={{ gap: '0.5rem' }}>
    <Tooltip text={t('logs.entries.tooltipGoToLatest')}>
      <GlyphMoveDown width={32} height={32} className='e2e-goToLatestpointer pointer gray o-70 hover-o-100 hover-black mb1' onClick={scrollToBottom} />
    </Tooltip>
  </div>
}

export interface LogViewerProps {
  logEntries: LogEntryType[]
  isStreaming: boolean
  // autoScrollEnabled: boolean
  containerRef: React.RefObject<HTMLDivElement>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  style?: React.CSSProperties
  startStreaming: () => void
  stopStreaming: () => void
}

interface LogEntryProps {
  logEntry: LogEntryType
}
const ROW_GAP = '0.3rem' as const
const LogEntry: React.FC<LogEntryProps> = ({ logEntry }) => {
  const { timestamp, level, subsystem, message, id } = logEntry
  return (
    <div key={`${timestamp}-${subsystem}-${id}`} className="lh-copy ml2 pb3 mb3 row">
      <span className="gray f7" title={timestamp}>
        {formatTimestamp(timestamp)}
      </span>
      <span className="fw6 f7 lvl" style={{ color: getLevelColor(level), whiteSpace: 'nowrap' }}>
        {level.toUpperCase()}
      </span>
      <span className="blue f7 sub" style={{ whiteSpace: 'nowrap' }} title={subsystem}>
        {subsystem}
      </span>
      <span className="f7 pre-wrap mr4 lh-copy msg" style={{ lineHeight: `calc(1.5em + ${ROW_GAP})` }}>
        {message}
      </span>
    </div>
  )
}

interface LogEntryListProps {
  logEntries: LogEntryType[]
}

const LogEntryList: React.FC<LogEntryListProps> = ({ logEntries }) => {
  const { t } = useTranslation('diagnostics')

  if (logEntries.length === 0) {
    return <p className='gray tc pa3'>{t('logs.entries.noEntries')}</p>
  }

  return <div className='logs pv2' style={{ rowGap: `calc(1.5 * ${ROW_GAP})` }}>
    {logEntries.map((logEntry) => <LogEntry logEntry={logEntry} />)}
  </div>
}

export const LogViewer: React.FC<LogViewerProps> = ({ logEntries, isStreaming, containerRef, onScroll, style, startStreaming, stopStreaming }) => {
  // const { t } = useTranslation('diagnostics')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
    setIsAtBottom(isNearBottom)

    // Call the parent's onScroll handler
    onScroll(e)
  }, [onScroll])

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [containerRef])

  const styles = useMemo<CSSProperties>(() => {
    const baseStyles = {
      fontFamily: 'Monaco, Consolas, monospace',
      ...style
    }
    if (isExpanded) {
      return {
        height: '90vh',
        width: '90vw',
        position: 'fixed',
        inset: '5%',
        zIndex: 1000,
        ...baseStyles
      }
    }
    return {
      height: '55vh',
      ...baseStyles
    }
  }, [style, isExpanded])

  return (
    <div className='relative' style={styles}>
      <TopControls isExpanded={isExpanded} setIsExpanded={setIsExpanded} isStreaming={isStreaming} startStreaming={startStreaming} stopStreaming={stopStreaming} />
      <div
        ref={containerRef}
        className='ba b--black-20 bg-near-white f6 overflow-auto overflow-x-hidden'
        style={{ height: '100%' }}
        onScroll={handleScroll}
      >
        <LogEntryList logEntries={logEntries} />
        <BottomControls isAtBottom={isAtBottom} scrollToBottom={scrollToBottom} />
      </div>
    </div>
  )
}
