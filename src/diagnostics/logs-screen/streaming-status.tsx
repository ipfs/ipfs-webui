import React from 'react'
import { useTranslation } from 'react-i18next'
import type { LogBufferConfig, LogRateState } from '../../contexts/logs/reducer'

interface StreamingStatusProps {
  isLogStreaming: boolean
  logRateState: LogRateState
  logBufferConfig: LogBufferConfig
}

export const StreamingStatus: React.FC<StreamingStatusProps> = ({
  isLogStreaming,
  logRateState,
  logBufferConfig
}) => {
  const { t } = useTranslation('diagnostics')

  if (!isLogStreaming) {
    return null
  }

  return (
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
  )
}
