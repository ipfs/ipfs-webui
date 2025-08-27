import React from 'react'
import { useTranslation } from 'react-i18next'
import { humanSize } from '../../lib/files.js'
import type { LogStorageStats as LogStorageStatsType } from '../../contexts/logs/log-storage'
import type { LogBufferConfig } from '../../contexts/logs/reducer'
import type { LogEntry } from '../../contexts/logs/api'

interface LogStorageStatsProps {
  logStorageStats: LogStorageStatsType | null
  logBufferConfig: LogBufferConfig
  safeLogEntries: LogEntry[]
}

export const LogStorageStats: React.FC<LogStorageStatsProps> = ({
  logStorageStats,
  logBufferConfig,
  safeLogEntries
}) => {
  const { t } = useTranslation('diagnostics')

  if (!logStorageStats) {
    return null
  }

  return (
    <div className='bt b--black-20 pt3'>
      <h4 className='montserrat fw6 charcoal ma0 f6 mb2'>{t('logs.storage.title')}</h4>
      <div className='flex items-center charcoal-muted f6'>
        <span className='mr3'>{t('logs.storage.totalEntries')}: {logStorageStats.totalEntries.toLocaleString()}</span>
        {/* @ts-expect-error - humanSize is not typed properly */}
        <span className='mr3'>{t('logs.storage.estimatedSize')}: {humanSize(logStorageStats.estimatedSize)}</span>
        <span>{t('logs.storage.memoryBuffer')}: {safeLogEntries.length}/{logBufferConfig.memory}</span>
      </div>
    </div>
  )
}
