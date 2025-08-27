import React, { type CSSProperties, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'src/components/tooltip/Tooltip'
import { GlyphShrink, GlyphExpand, GlyphPlay, GlyphPause } from '../../icons/all'

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

  return <div className='absolute top-1 right-0 mr4 z-10 flex flex-row' style={{ gap: '0.5rem' }}>
    <Tooltip text={isStreaming ? t('logs.entries.tooltipPause') : t('logs.entries.tooltipPlay')}>
      <PlayPauseControl width={32} height={32} className='pointer gray o-30 hover-o-100 hover-black' onClick={toggleStreaming} />
    </Tooltip>
    <Tooltip text={isExpanded ? t('logs.entries.tooltipCollapse') : t('logs.entries.tooltipExpand')}>
      <SizeControl width={32} height={32} className='pointer gray o-30 hover-o-100 hover-black mb1' onClick={() => setIsExpanded(!isExpanded)} />
    </Tooltip>
  </div>
}

export interface LogViewerProps {
  logEntries: any[]
  isStreaming: boolean
  autoScrollEnabled: boolean
  containerRef: React.RefObject<HTMLDivElement>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  style?: React.CSSProperties
  startStreaming: () => void
  stopStreaming: () => void
}

export const LogViewer: React.FC<LogViewerProps> = ({ logEntries, isStreaming, autoScrollEnabled, containerRef, onScroll, style, startStreaming, stopStreaming }) => {
  const { t } = useTranslation('diagnostics')
  const [isExpanded, setIsExpanded] = useState(false)

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
      height: '400px',
      ...baseStyles
    }
  }, [style, isExpanded])

  return (
    <div className='relative' style={styles}>
      <TopControls isExpanded={isExpanded} setIsExpanded={setIsExpanded} isStreaming={isStreaming} startStreaming={startStreaming} stopStreaming={stopStreaming} />
      <div
        ref={containerRef}
        className='ba b--black-20 pa2 bg-near-white f6 overflow-auto overflow-x-hidden'
        style={{ height: '100%' }}
        onScroll={onScroll}
      >
        {logEntries.length === 0
          ? <p className='gray tc pa3'>{t('logs.entries.noEntries')}</p>
          : <div>
             {logEntries.map((entry, index) => (
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
          {isStreaming && autoScrollEnabled && (
            <div className='tc pa2 charcoal-muted f6'>
              {t('logs.entries.streaming')}
            </div>
          )}
        </div>}
      </div>
    </div>
  )
}
