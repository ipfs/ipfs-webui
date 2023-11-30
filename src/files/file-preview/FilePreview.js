import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { isBinary } from 'istextorbinary'
import { Trans, withTranslation } from 'react-i18next'
import typeFromExt from '../type-from-ext/index.js'
import ComponentLoader from '../../loader/ComponentLoader.js'
import './FilePreview.css'
import { CID } from 'multiformats/cid'
import { useDrag } from 'react-dnd'
import { toString as fromUint8ArrayToString } from 'uint8arrays'
import Button from '../../components/button/Button.js'

const Drag = ({ name, size, cid, path, children }) => {
  const [, drag] = useDrag({
    item: { name, size, cid, path, type: 'FILE' }
  })

  return <div ref={drag}>
    { children }
  </div>
}

const Preview = (props) => {
  const { t, name, cid, size, availableGatewayUrl, publicGateway, read, onDownload } = props
  const [content, setContent] = useState(null)
  const [hasMoreContent, setHasMoreContent] = useState(false)
  const [buffer, setBuffer] = useState(null)
  const type = typeFromExt(name)

  const loadContent = useCallback(async () => {
    const readBuffer = buffer || await read()
    if (!buffer) {
      setBuffer(readBuffer)
    }

    const { value, done } = await readBuffer.next()
    const previousContent = content || ''

    const currentContent = previousContent + fromUint8ArrayToString(value)

    setContent(currentContent)

    const hasMore = !done && new TextEncoder().encode(currentContent).length < size

    setHasMoreContent(hasMore)
  }, [buffer, content, read, size])

  useEffect(() => {
    loadContent()
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  const src = `${availableGatewayUrl}/ipfs/${cid}?filename=${encodeURIComponent(name)}`
  const className = 'mw-100 mt3 bg-snow-muted pa2 br2 border-box'

  switch (type) {
    case 'audio':
      return (
        <Drag {...props}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio width='100%' controls>
            <source src={src} />
          </audio>
        </Drag>
      )
    case 'pdf':
      return (
        <Drag {...props}>
          <object className="FilePreviewPDF w-100" data={src} type='application/pdf'>
            {t('noPDFSupport')}
            <a href={src} download target='_blank' rel='noopener noreferrer' className='underline-hover navy-muted'>{t('downloadPDF')}</a>
          </object>
        </Drag>
      )
    case 'video':
      return (
        <Drag {...props}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video controls className={className}>
            <source src={src} />
          </video>
        </Drag>
      )
    case 'image':
      return (
        <Drag {...props}>
          <img className={className} alt={name} src={src} />
        </Drag>
      )
    default: {
      const srcPublic = `${publicGateway}/ipfs/${cid}?filename=${encodeURIComponent(name)}`

      const cantPreview = (
        <div className='mt4'>
          <p className='b'>{t('cantBePreviewed')} <span role='img' aria-label='sad'>😢</span></p>
          <p>
            { availableGatewayUrl === publicGateway
              ? <Trans i18nKey='openWithPublicGateway' t={t}>
            Try opening it instead with your <a href={src} download target='_blank' rel='noopener noreferrer' className='link blue'>public gateway</a>.
              </Trans>
              : <Trans i18nKey='openWithLocalAndPublicGateway' t={t}>
          Try opening it instead with your <a href={src} download target='_blank' rel='noopener noreferrer' className='link blue'>local gateway</a> or <a href={srcPublic} download target='_blank' rel='noopener noreferrer' className='link blue'>public gateway</a>.
              </Trans>

            }

          </p>
        </div>
      )

      if (size > 1024 * 1024 * 4) {
        return cantPreview
      }

      if (!content) {
        return <ComponentLoader />
      }

      if (isBinary(name, content)) {
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
  'selectPublicGateway',
  withTranslation('files')(Preview)
)
