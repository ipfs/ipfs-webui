import React, { useState } from 'react'
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
import first from 'it-first'
import fromUint8ArrayToString from 'uint8arrays/to-string'

const Preview = (props) => {
  const { name, size, cid, path } = props
  const [, drag] = useDrag({
    item: { name, size, cid, path, type: 'FILE' }
  })

  const type = typeFromExt(name)

  return <div className={ classNames(type !== 'pdf' && type !== 'text' && type !== 'json' && 'dib') } ref={drag}>
    <PreviewItem {...props} type={type} />
  </div>
}

const PreviewItem = ({ t, name, cid, size, type, availableGatewayUrl: gatewayUrl, read }) => {
  const [content, setContent] = useState(null)

  const loadContent = async () => {
    const buf = await first(await read())
    setContent(fromUint8ArrayToString(buf))
  }

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
        loadContent()
        return <ComponentLoader pastDelay />
      }

      if (isBinary(content)) {
        return cantPreview
      }

      return (
        <pre className={`${className} overflow-auto monospace`}>
          {content}
        </pre>
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
  tReady: PropTypes.bool.isRequired
}

export default connect(
  'selectAvailableGatewayUrl',
  withTranslation('files')(Preview)
)
