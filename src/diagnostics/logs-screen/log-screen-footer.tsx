import React from 'react'
import { useTranslation } from 'react-i18next'
import { humanSize } from '../../lib/files.js'
import Tooltip from '../../components/tooltip/Tooltip'
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
      <div className='items-center mb2 mb0-ns statsBar'>
        <h4 className='montserrat fw6 charcoal ma0 f6 title'>{t('logs.storage.title')}</h4>
        <div className='status'>
          <StreamingStatus />
        </div>
        <div className='trash'>
          <Tooltip text={t('logs.storage.trashTooltip')} >
            <GlyphTrash width={32} height={32} className='pointer gray o-30 hover-o-100 hover-black' onClick={() => clearEntries()} />
          </Tooltip>
        </div>
      </div>
      <div className='flex items-center charcoal-muted f6'>
        <span className='mr3'>{t('logs.storage.totalEntries')}: {storageStats.totalEntries.toLocaleString()}</span>
        {/* @ts-expect-error - humanSize is not typed properly */}
        <span className='mr3'>{t('logs.storage.estimatedSize')}: {humanSize(storageStats.estimatedSize)}</span>
        <span>{t('logs.storage.memoryBuffer')}: {entries.length}/{bufferConfig.memory}</span>
      </div>
    </div>
  )
}
