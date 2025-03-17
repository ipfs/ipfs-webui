import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { isBinary } from 'istextorbinary'
import { Trans, withTranslation } from 'react-i18next'
import typeFromExt from '../type-from-ext/index.js'
import ComponentLoader from '../../loader/component-loader.js'
import './file-preview.css'
import { CID } from 'multiformats/cid'
import { useDrag } from 'react-dnd'
import { toString as fromUint8ArrayToString } from 'uint8arrays'
import Button from '../../components/button/button.tsx'

const maxPlainTextPreview = 1024 * 10 // only preview small part of huge files

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
    if (['audio', 'video', 'pdf', 'image'].includes(type)) {
      // noop, we dont need to read() preview for these because we embed them on page
      return
    }
    const readBuffer = buffer || await read(0, maxPlainTextPreview)
    if (!buffer) {
      setBuffer(readBuffer)
    }

    const { value, done } = await readBuffer.next()
    const previousContent = content || ''

    const currentContent = previousContent + fromUint8ArrayToString(value)

    setContent(currentContent)

    const hasMore = !done && new TextEncoder().encode(currentContent).length < size

    setHasMoreContent(hasMore)
  }, [buffer, content, read, size, type])

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
            <source src={safeSubresourceGwUrl(src)} />
          </audio>
        </Drag>
      )
    case 'pdf':
      return (
        <Drag {...props}>
          <object className="FilePreviewPDF w-100" data={safeSubresourceGwUrl(src)} type='application/pdf'>
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
            <source src={safeSubresourceGwUrl(src)} />
          </video>
        </Drag>
      )
    case 'image':
      return (
        <Drag {...props}>
          <img className={className} alt={name} src={safeSubresourceGwUrl(src)} />
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

      if (content === null) {
        return <ComponentLoader />
      }

      // a precaution to not render too much, in case we overread
      if (content.length > maxPlainTextPreview) {
        return cantPreview
      }

      if (isBinary(name, content)) {
        return cantPreview
      }

      return <>
        <pre className={`${className} overflow-auto monospace`}>
          {content}
        </pre>
        { hasMoreContent && <div className="w-100 flex items-center justify-center">
          <p><Trans i18nKey='previewLimitReached' t={t}>This preview is limited to 10 KiB. Click the download button to access the full file.</Trans></p>
          <p>
          <Button className="mh2 lh-copy bn justify-center flex " onClick={ onDownload }>
            { t('app:actions.download')}
          </Button>
          </p>
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

// Potential fix for mixed-content error when redirecting to localhost subdomain
// from https://github.com/ipfs/ipfs-webui/issues/2246#issuecomment-2322192398
// We do it here and not in src/bundles/config.js because we dont want IPLD
// explorer to open links in path gateway, localhost is desired there.
//
// Context: localhost in Kubo is a subdomain gateway, so http://locahost:8080/ipfs/cid will
// redirect to http://cid.ipfs.localhost:8080 – perhaps subdomains are not
// interpreted as secure context correctly and that triggers forced upgrade to
// https. switching to IP should help.
function safeSubresourceGwUrl (url) {
  if (url.startsWith('http://localhost:')) {
    return url.replace('http://localhost:', 'http://127.0.0.1:')
  }
  return url
}
