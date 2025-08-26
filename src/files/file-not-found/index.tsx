import React from 'react'
import Button from '../../components/button/button.js'
import GlyphAttention from '../../icons/GlyphAttention.js'
import { useTranslation } from 'react-i18next'

export interface FileNotFoundProps {
  path: string
}

const FileNotFound = ({ path }: FileNotFoundProps) => {
  const { t } = useTranslation('files')

  return (
    <div
      className='mb3 pa4-l pa2 mw9 center'
      style={{ background: 'rgba(251, 251, 251)' }}
    >
      <div className='flex flex-row items-center mb3'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <div className='red fw6 truncate'>{t('previewNotFound.title')}</div>
      </div>
      <div className='mb3 charcoal fw6 truncate'>{path}</div>
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
