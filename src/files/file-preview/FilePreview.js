import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { isBinary } from 'istextorbinary'
import { Trans, withTranslation } from 'react-i18next'
import typeFromExt from '../type-from-ext/index.js'
import { toLoopbackIpUrl, getLocalContentLink } from '../../lib/share-link.js'
import ComponentLoader from '../../loader/ComponentLoader.js'
import './FilePreview.css'
import { CID } from 'multiformats/cid'
import { useDrag } from 'react-dnd'
import { toString as fromUint8ArrayToString } from 'uint8arrays'
import Button from '../../components/button/button.tsx'
import GlyphCancel from '../../icons/GlyphCancel.js'

const maxPlainTextPreview = 1024 * 10 // only preview small part of huge files

// Utility function for middle truncation of filenames
function truncateMiddle (filename, maxLength = 40) {
  if (filename.length <= maxLength) {
    return filename
  }

  const lastDotIndex = filename.lastIndexOf('.')
  const hasExtension = lastDotIndex !== -1
  const extension = hasExtension ? filename.slice(lastDotIndex) : ''
  const nameWithoutExt = hasExtension ? filename.slice(0, lastDotIndex) : filename

  // Reserve space for extension and ellipsis
  const reserved = extension.length + 3
  if (maxLength <= reserved + 2) {
    return filename.slice(0, maxLength) // Fallback if maxLength is too small
  }

  // Split available length into front and back parts
  const availableLength = maxLength - reserved
  const frontLength = Math.ceil(availableLength / 2)
  const backLength = Math.floor(availableLength / 2)

  const front = nameWithoutExt.slice(0, frontLength)
  const back = nameWithoutExt.slice(-backLength)

  return `${front}...${back}${extension}`
}

const Drag = ({ name, size, cid, path, children }) => {
  const [, drag] = useDrag({
    item: { name, size, cid, path, type: 'FILE' }
  })

  return <div ref={drag}>
    { children }
  </div>
}

const Preview = (props) => {
  const { t, name, cid, size, availableGatewayUrl, localGatewayUrl, publicGateway, shareLinkType, read, onDownload, onClose } = props
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

  const filenameQuery = `?filename=${encodeURIComponent(name)}`
  // Embedded subresources (img/video/audio/object) load from the available
  // gateway in its IP form; see toLoopbackIpUrl.
  const src = toLoopbackIpUrl(`${availableGatewayUrl}/ipfs/${cid}${filenameQuery}`)
  const className = 'mw-100 mt3 bg-snow-muted pa2 br2 border-box'

  // Links that open the file in a new tab. The local one honors the Share Link
  // type from Settings, giving content its own origin when the user chose the
  // local subdomain gateway; either link is '' when its gateway is not
  // configured.
  const cidObj = CID.asCID(cid) ?? CID.parse(String(cid))
  const localUrl = getLocalContentLink({
    shareLinkType,
    namespace: 'ipfs',
    pathId: cidObj.toString(),
    subdomainLabel: cidObj.toV1().toString(),
    filename: filenameQuery,
    localGatewayUrl
  })
  const publicUrl = publicGateway ? `${publicGateway}/ipfs/${cid}${filenameQuery}` : ''
  const openUrl = localUrl || publicUrl

  // Close button header
  const closeButtonHeader = onClose != null && (
    <div className="flex items-center justify-between mb3 pb2 bb b--light-gray">
      <div className="flex items-center flex-auto mr2">
        <h2
          className="ma0 f4 charcoal"
          title={name}
          style={{ wordBreak: 'break-all', maxWidth: '100%' }}
        >
          {truncateMiddle(name, 40)}
        </h2>
      </div>
      <GlyphCancel
        onClick={onClose}
        style={{ width: '44px', height: '44px', fill: '#244c5a', cursor: 'pointer', flexShrink: 0 }}
      />
    </div>
  )

  const openLinks = localUrl && publicUrl
    ? <Trans i18nKey='openWithLocalAndPublicGateway' t={t}>
      Try opening it instead with your <a href={localUrl} download target='_blank' rel='noopener noreferrer' className='link blue'>local gateway</a> or <a href={publicUrl} download target='_blank' rel='noopener noreferrer' className='link blue'>public gateway</a>.
    </Trans>
    : localUrl
      ? <Trans i18nKey='openWithLocalGateway' t={t}>
        Try opening it instead with your <a href={localUrl} download target='_blank' rel='noopener noreferrer' className='link blue'>local gateway</a>.
      </Trans>
      : publicUrl
        ? <Trans i18nKey='openWithPublicGateway' t={t}>
          Try opening it instead with your <a href={publicUrl} download target='_blank' rel='noopener noreferrer' className='link blue'>public gateway</a>.
        </Trans>
        : null

  const cantPreview = (
    <div className='mt4'>
      <p className='b'>{t('cantBePreviewed')} <span role='img' aria-label='sad'>😢</span></p>
      { openLinks && <p>{openLinks}</p> }
    </div>
  )

  // Embedded previews need a gateway to load from; without one, offer the
  // open-elsewhere links instead of a broken embed.
  if (['audio', 'video', 'pdf', 'image'].includes(type) && !availableGatewayUrl) {
    return (
      <div>
        {closeButtonHeader}
        {cantPreview}
      </div>
    )
  }

  switch (type) {
    case 'audio':
      return (
        <div>
          {closeButtonHeader}
          <Drag {...props}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio width='100%' controls>
              <source src={src} />
            </audio>
          </Drag>
        </div>
      )
    case 'pdf':
      return (
        <div>
          {closeButtonHeader}
          <Drag {...props}>
            <object className="FilePreviewPDF w-100" data={src} type='application/pdf'>
              {t('noPDFSupport')}
              { openUrl && <a href={openUrl} download target='_blank' rel='noopener noreferrer' className='underline-hover navy-muted'>{t('downloadPDF')}</a> }
            </object>
          </Drag>
        </div>
      )
    case 'video':
      return (
        <div>
          {closeButtonHeader}
          <Drag {...props}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video controls className={className}>
              <source src={src} />
            </video>
          </Drag>
        </div>
      )
    case 'image':
      return (
        <div>
          {closeButtonHeader}
          <Drag {...props}>
            <img className={className} alt={name} src={src} />
          </Drag>
        </div>
      )
    default: {
      if (content === null) {
        return (
          <div>
            {closeButtonHeader}
            <ComponentLoader />
          </div>
        )
      }

      // a precaution to not render too much, in case we overread
      if (content.length > maxPlainTextPreview) {
        return (
          <div>
            {closeButtonHeader}
            {cantPreview}
          </div>
        )
      }

      if (isBinary(name, content)) {
        return (
          <div>
            {closeButtonHeader}
            {cantPreview}
          </div>
        )
      }

      return (
        <div>
          {closeButtonHeader}
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
        </div>
      )
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
  tReady: PropTypes.bool.isRequired,
  onClose: PropTypes.func
}

export default connect(
  'selectAvailableGatewayUrl',
  'selectLocalGatewayUrl',
  'selectPublicGateway',
  'selectShareLinkType',
  withTranslation('files')(Preview)
)
