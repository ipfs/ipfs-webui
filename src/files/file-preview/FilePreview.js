import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'redux-bundler-react'
import isBinary from 'is-binary'
import { Trans, withTranslation } from 'react-i18next'
import typeFromExt from '../type-from-ext'
import ComponentLoader from '../../loader/ComponentLoader.js'
import './FilePreview.css'
import CID from 'cids'
import { useDrag } from 'react-dnd'
import fromUint8ArrayToString from 'uint8arrays/to-string'
import Button from '../../components/button/Button'

const Preview = (props) => {
  const { name, size, cid, path } = props
  const [, drag] = useDrag({
    item: { name, size, cid, path, type: 'FILE' }
  })

  const type = typeFromExt(name)

  // Hack: Allows for text selection if it's a text file (bypass useDrag)
  const dummyRef = useRef()

  return <div className={ classNames(type !== 'pdf' && type !== 'text' && type !== 'json' && 'dib') } ref={type === 'text' ? dummyRef : drag}>
    <PreviewItem {...props} type={type} />
  </div>
}

const PreviewItem = ({ t, name, cid, size, type, availableGatewayUrl: gatewayUrl, read, onDownload }) => {
  const [content, setContent] = useState(null)
  const [hasMoreContent, setHasMoreContent] = useState(false)
  const [buffer, setBuffer] = useState(null)

  const loadContent = useCallback(async () => {
    const readBuffer = buffer || await read()
    if (!buffer) {
      setBuffer(readBuffer)
    }

    const { value, done } = await readBuffer.next()
    const previousContent = content || ''

    const currentContent = previousContent + fromUint8ArrayToString(value)

    setContent(currentContent)

    if (currentContent.length === size) return

    setHasMoreContent(!done)
  }, [buffer, content, read, size])

  useEffect(() => {
    loadContent()
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  const src = `${gatewayUrl}/ipfs/${cid}`
  const className = 'mw-100 mt3 bg-snow-muted pa2 br2 border-box'

  switch (type) {
    case 'audio':
      return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio width='100%' controls>
          <source src={src} />
        </audio>
      )
    case 'pdf':
      return (
        <object className="FilePreviewPDF w-100" data={src} type='application/pdf'>
          {t('noPDFSupport')}
          <a href={src} download target='_blank' rel='noopener noreferrer' className='underline-hover navy-muted'>{t('downloadPDF')}</a>
        </object>
      )
    case 'video':
      return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
        <video controls className={className}>
          <source src={src} />
        </video>
      )
    case 'image':
      return <img className={className} alt={name} src={src} />
    default: {
      const cantPreview = (
        <div className='mt4'>
          <p className='b'>{t('cantBePreviewed')} <span role='img' aria-label='sad'>😢</span></p>
          <p>
            <Trans i18nKey='downloadInstead' t={t}>
                Try <a href={src} download target='_blank' rel='noopener noreferrer' className='link blue' >downloading</a> it instead.
            </Trans>
          </p>
        </div>
      )

      if (size > 1024 * 1024 * 4) {
        return cantPreview
      }

      if (!content) {
        return <ComponentLoader pastDelay />
      }

      if (isBinary(content)) {
        loadContent()
        return cantPreview
      }

      return <>
        <pre className={`${className} overflow-auto monospace`}>
          {content}
        </pre>
        { hasMoreContent && <div className="w-100 flex items-center justify-center">
          <Button onClick={ loadContent }>
            { t('loadMore')}
          </Button>
          <Button className="mh2" onClick={ onDownload }>
            { t('app:actions.download')}
          </Button>
        </div>}
      </>
    }
  }
}

Preview.propTypes = {
  name: PropTypes.string.isRequired,
  hash: PropTypes.instanceOf(CID),
  size: PropTypes.number.isRequired,
  availableGatewayUrl: PropTypes.string.isRequired,
  read: PropTypes.func.isRequired,
  content: PropTypes.object,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

export default connect(
  'selectAvailableGatewayUrl',
  withTranslation('files')(Preview)
)
