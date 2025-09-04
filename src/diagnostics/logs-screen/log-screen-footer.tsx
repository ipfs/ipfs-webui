import React from 'react'
import { useTranslation } from 'react-i18next'
import { humanSize } from '../../lib/files.js'
import IconTooltip from '../../components/tooltip/icon-tooltip'
import { GlyphTrash } from '../../icons/all'
import { useLogs } from '../../contexts/logs/logs-context'
import { StreamingStatus } from './streaming-status'
import './log-screen-footer.css'

export const LogScreenFooter: React.FC = () => {
  const { t } = useTranslation('diagnostics')
  const { clearEntries, bufferConfig, storageStats, entries } = useLogs()

  if (!storageStats) {
    return null
  }

  return (
    <div className='pt0'>
      <div className='statsBar flex items-center justify-between'>
        <div className='flex items-center'>
          <h4 className='montserrat fw6 charcoal ma0 f6 mr2'>{t('logs.storage.title')}:</h4>
          <span className='charcoal-muted f6 mr3'>{t('logs.storage.totalEntries')}: {storageStats.totalEntries.toLocaleString()}</span>
          {/* @ts-expect-error - humanSize is not typed properly */}
          <span className='charcoal-muted f6 mr3'>{t('logs.storage.estimatedSize')}: {humanSize(storageStats.estimatedSize)}</span>
          <span className='charcoal-muted f6'>{t('logs.storage.memoryBuffer')}: {entries.length}/{bufferConfig.memory}</span>
        </div>
        <div className='flex items-center'>
          <StreamingStatus className='mr3' />
          <IconTooltip text={t('logs.storage.trashTooltip')} position='left'>
            <GlyphTrash width={32} height={32} className='pointer gray o-30 hover-o-100 hover-black' onClick={() => clearEntries()} />
          </IconTooltip>
        </div>
      </div>
    </div>
  )
}
