import React, { type CSSProperties, useMemo, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import IconTooltip from '../../components/tooltip/icon-tooltip'
import { GlyphShrink, GlyphExpand, GlyphPlay, GlyphPause, GlyphMoveDown, GlyphSettings, GlyphTrash } from '../../icons/all'
import { BufferConfigModal } from './buffer-config-modal'
import { useLogs } from '../../contexts/logs'
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
  onSettingsClick: () => void
  isAtBottom: boolean
  scrollToBottom: () => void
}

const TopControls: React.FC<TopControlsProps> = ({ isExpanded, setIsExpanded, isStreaming, startStreaming, stopStreaming, onSettingsClick, isAtBottom, scrollToBottom }) => {
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
    <div className='absolute top-1 right-0 mr3 z-10 flex flex-column flex-start items-end'>
      <IconTooltip key={isExpanded ? 'expanded' : 'collapsed'} text={isExpanded ? t('logs.entries.tooltipCollapse') : t('logs.entries.tooltipExpand')} position='left'>
        <SizeControl width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black mb1' onClick={() => setIsExpanded(!isExpanded)} />
      </IconTooltip>
      <IconTooltip text={t('logs.entries.tooltipSettings')} position='left'>
        <GlyphSettings width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black mb1 fill-current-color' style={settingsIconStyle} onClick={onSettingsClick} />
      </IconTooltip>
      <IconTooltip text={isStreaming ? t('logs.entries.tooltipPause') : t('logs.entries.tooltipPlay')} position='left'>
        <PlayPauseControl width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black mb1' onClick={toggleStreaming} />
      </IconTooltip>
      {!isAtBottom && (
        <IconTooltip text={t('logs.entries.tooltipGoToLatest')} position='left'>
          <GlyphMoveDown width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black' onClick={scrollToBottom} />
        </IconTooltip>
      )}
    </div>
  )
}

interface BottomControlsProps {
  clearEntries: () => void
}

const BottomControls: React.FC<BottomControlsProps> = ({ clearEntries }) => {
  const { t } = useTranslation('diagnostics')

  return <div className='absolute bottom-1 right-0 mr3 z-10'>
    <IconTooltip text={t('logs.storage.trashTooltip')} position='left'>
      <GlyphTrash width={32} height={32} className='pointer gray o-70 hover-o-100 hover-black mb1 fill-current-color' onClick={clearEntries} />
    </IconTooltip>
  </div>
}

export interface LogViewerProps {
  logEntries: LogEntryType[]
  isStreaming: boolean
  containerRef: React.RefObject<HTMLDivElement>
  style?: React.CSSProperties
  startStreaming: () => void
  stopStreaming: () => void
  clearEntries: () => void
}

interface LogEntryProps {
  logEntry: LogEntryType
}
const ROW_GAP = '0.3rem' as const
const LogEntry = React.memo<LogEntryProps>(({ logEntry }) => {
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
})

interface LogEntryListProps {
  logEntries: LogEntryType[]
}

const LogEntryList: React.FC<LogEntryListProps> = ({ logEntries }) => {
  const { t } = useTranslation('diagnostics')

  if (logEntries.length === 0) {
    return (
      <div className='mv4 tc charcoal f5'>
        <p className='ma0 sans-serif'>{t('logs.entries.noEntries')}</p>
      </div>
    )
  }

  return <div className='logs pv2' style={{ rowGap: `calc(1.5 * ${ROW_GAP})` }}>
    {logEntries.map((logEntry) => (
      <LogEntry key={logEntry.id} logEntry={logEntry} />
    ))}
  </div>
}

export const LogViewer: React.FC<LogViewerProps> = ({ logEntries, isStreaming, containerRef, style, startStreaming, stopStreaming, clearEntries }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const lastLogEntryId = useMemo(() => logEntries[logEntries.length - 1]?.id, [logEntries])

  const { bufferConfig: logBufferConfig, updateBufferConfig: doUpdateLogBufferConfig } = useLogs()

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
    setIsAtBottom(isNearBottom)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [containerRef])

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
    // only scroll to bottom if the last log entry id has changed, and we were previously at the bottom
    // this will lock the view to the bottom of the logs list while the logs are streaming, unless the user scrolls up
  }, [isAtBottom, scrollToBottom, lastLogEntryId])

  const styles = useMemo<CSSProperties>(() => {
    const baseStyles = {
      ...style
    }
    if (isExpanded) {
      return {
        height: '90vh',
        width: '90vw',
        position: 'fixed',
        inset: '5%',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        ...baseStyles
      }
    }
    return {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...baseStyles
    }
  }, [style, isExpanded])

  return (
    <>
      {isExpanded && (
        // Backdrop overlay with blur effect to focus attention on the expanded log viewer
        // Clicking or pressing Enter/Space on this backdrop will collapse the viewer
        <div
          className='fixed top-0 left-0 right-0 bottom-0'
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 999
          }}
          role="button"
          tabIndex={0}
          aria-label="Click to collapse log viewer"
          onClick={() => setIsExpanded(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsExpanded(false)
            }
          }}
        />
      )}
      <div className='relative code' style={styles}>
        <TopControls isExpanded={isExpanded} setIsExpanded={setIsExpanded} isStreaming={isStreaming} startStreaming={startStreaming} stopStreaming={stopStreaming} onSettingsClick={() => setIsSettingsModalOpen(true)} isAtBottom={isAtBottom} scrollToBottom={scrollToBottom} />
        <div
          ref={containerRef}
          className='ba b--black-20 bg-near-white f6 overflow-auto overflow-x-hidden flex-auto'
          style={{ minHeight: 0 }}
          onScroll={handleScroll}
        >
          <LogEntryList logEntries={logEntries} />
          <BottomControls clearEntries={clearEntries} />
        </div>

        <BufferConfigModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentConfig={logBufferConfig}
          onApply={doUpdateLogBufferConfig}
        />
      </div>
    </>
  )
}
