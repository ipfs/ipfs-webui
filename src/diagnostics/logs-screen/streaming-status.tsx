import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLogs } from '../../contexts/logs/logs-context'

export const StreamingStatus: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation('diagnostics')
  const { isStreaming, rateState, bufferConfig } = useLogs()

  const streamingStatus = useMemo(() => {
    if (!isStreaming) {
      return t('logs.streaming.statusStopped')
    }

    return t('logs.streaming.statusActive')
  }, [isStreaming, t])

  const streamingColorClass = useMemo(() => {
    if (!isStreaming) {
      return 'red-muted'
    }
    return 'green'
  }, [isStreaming])

  const highRateWarning = useMemo(() => {
    if (rateState.currentRate > bufferConfig.warnThreshold) {
      return <span className='yellow f6'>{t('logs.streaming.highRate')}</span>
    }
    return null
  }, [rateState.currentRate, bufferConfig.warnThreshold, t])

  const autoDisabledWarning = useMemo(() => {
    if (rateState.autoDisabled) {
      return <span className='ml2 red f6'>{t('logs.streaming.autoDisabled')}</span>
    }
    return null
  }, [rateState.autoDisabled, t])

  return (
    <div className={`flex items-center lh-solid ${className}`}>
      <span className={`${streamingColorClass} f6 mr2`}>{streamingStatus}</span>
      <span className='charcoal-muted f6 mr3'>
        {t('logs.streaming.rate', { rate: rateState.currentRate.toFixed(1) })}
      </span>
      {highRateWarning}
      {autoDisabledWarning}
    </div>
  )
}
