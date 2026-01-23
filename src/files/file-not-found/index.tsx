import React from 'react'
import Button from '../../components/button/button.js'
import GlyphAttention from '../../icons/GlyphAttention.js'
import { useTranslation } from 'react-i18next'

export interface FileNotFoundProps {
  path: string
  error?: string
}

const FileNotFound = ({ path, error }: FileNotFoundProps) => {
  const { t } = useTranslation('files')

  return (
    <div
      className='mb3 pa4-l pa2 mw9 center'
      style={{ background: 'rgba(251, 251, 251)' }}
    >
      <div className='flex flex-row items-center mb3'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <div className='red fw6 truncate f3'>{t('previewNotFound.title')}</div>
      </div>
      <div className='mb3 charcoal fw6 truncate'>{path}</div>
      {error != null && (
        <div className='mb3 pa3 br2 f6' style={{ fontFamily: 'monospace', wordBreak: 'break-word', background: '#2a2a2a', color: '#f5f5f5', border: '1px solid #444' }}>
          <span style={{ color: '#ff6b6b' }}>Error:</span> {error}
        </div>
      )}
      <div className='mb3'>{t('previewNotFound.helpTitle')}</div>
      <ul>
        <li>{t('previewNotFound.helpListItemPathTypo')}</li>
        <li>{t('previewNotFound.helpListItemFileMoved')}</li>
        <li>{t('previewNotFound.helpListItemBookmarkMigrated')} <a href="#/peers">{t('previewNotFound.helpListItemBookmarkMigratedLink')}</a>.</li>
      </ul>
      <a href="#/files">
        <Button className='ma2 tc' bg='bg-teal'>{t('previewNotFound.backButton')}</Button>
      </a>
    </div>
  )
}

export default FileNotFound
