import React from 'react'
import Box from '../../components/box/Box.js'
import Button from '../../components/button/button.js'
import GlyphAttention from '../../icons/GlyphAttention.js'
import { Trans, useTranslation } from 'react-i18next'

export interface FileNotFoundProps {
  path: string
  error?: string
}

const FileNotFound = ({ path, error }: FileNotFoundProps) => {
  const { t } = useTranslation('files')

  return (
    <Box className='pv3 ph4 lh-copy charcoal'>
      <div className='flex items-start mb3'>
        <GlyphAttention style={{ height: 76, flexShrink: 0 }} className='fill-red mr3' role='presentation' />
        <div>
          <h1 className='montserrat fw4 ma0 f3 red'>{t('previewNotFound.title')}</h1>
          <p className='f5 charcoal fw5 ma0 mt2 truncate' title={path}>{path}</p>
        </div>
      </div>
      {error != null && (
        <pre className='pa3 br2 f7 lh-copy overflow-auto bg-black-70 snow ma0 mb3' style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <span className='red'>{t('previewNotFound.errorPrefix')}</span> {error}
        </pre>
      )}
      <p className='fw6 mb2'>{t('previewNotFound.helpTitle')}</p>
      <ul className='pl3 mt0'>
        {error != null && (
          <li className='mb2'>{t('previewNotFound.helpListItemSearchError')}</li>
        )}
        <li className='mb2'>
          <Trans i18nKey='previewNotFound.helpListItemInspect' t={t}>
            Try <a className='link blue' href='#/explore'>inspecting the path</a> (or its parent) in DAG Explorer to debug the issue.
          </Trans>
        </li>
        <li className='mb2'>
          <Trans i18nKey='previewNotFound.helpListItemRetrieval' t={t}>
            If you have a CID you believe should work, <a className='link blue' href='#/diagnostics/retrieval-check'>run Retrieval Diagnostics</a>.
          </Trans>
        </li>
        <li className='mb2'>
          <Trans i18nKey='previewNotFound.helpListItemForums' t={t}>
            Visit the <a className='link blue' href='https://discuss.ipfs.tech' target='_blank' rel='noopener noreferrer'>Discussion Forums</a> to ask for help.
          </Trans>
        </li>
      </ul>
      <a href='#/files'>
        <Button className='mt3 tc' bg='bg-teal'>{t('previewNotFound.backButton')}</Button>
      </a>
    </Box>
  )
}

export default FileNotFound
