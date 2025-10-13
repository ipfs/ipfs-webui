import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { isBinary } from 'istextorbinary'
import typeFromExt from '../type-from-ext/index.js'
import './FileThumbnail.css'

const MAX_TEXT_LENGTH = 500 // This is the maximum characters to show in text preview

const FileThumbnail = ({ name, cid, availableGatewayUrl, read, onLoad }) => {
  const [error, setError] = useState(false)
  const [content, setContent] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const type = typeFromExt(name)

  const handleImageError = useCallback(() => {
    setError(true)
    setImageLoaded(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    onLoad?.()
  }, [onLoad])

  useEffect(() => {
    const loadContent = async () => {
      if (type === 'image') {
        return
      }

      try {
        if (!read) return

        const readBuffer = await read(0, MAX_TEXT_LENGTH)
        const { value } = await readBuffer.next()

        if (value) {
          const text = new TextDecoder().decode(value)
          if (!isBinary(name, text)) {
            setContent(text)
            onLoad?.()
          }
        }
      } catch (err) {
        console.error('Error loading file preview:', err)
        setError(true)
      }
    }

    loadContent()
    return () => {
      setContent(null)
      setError(false)
      // setImageLoaded(false)
    }
  }, [type, name, read, onLoad])

  useEffect(() => {
    setImageLoaded(false)
    setError(false)
  }, [cid, name])

  if (error || (!content && !type.startsWith('image'))) {
    return null
  }

  if (type === 'image') {
    const src = `${availableGatewayUrl}/ipfs/${cid}?filename=${encodeURIComponent(name)}`
    return (
      <div className={`file-thumbnail ${!imageLoaded ? 'is-loading' : ''}`}>
        <div className="file-thumbnail-loading" />
        <img
          className="w-100 h-100 object-contain br2"
          alt={name}
          src={src}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  if (content) {
    return (
      <div className="file-thumbnail file-thumbnail-text">
        <pre className="file-thumbnail-content">
          {content}
        </pre>
      </div>
    )
  }

  return null
}

FileThumbnail.propTypes = {
  name: PropTypes.string.isRequired,
  cid: PropTypes.object.isRequired,
  availableGatewayUrl: PropTypes.string.isRequired,
  read: PropTypes.func,
  onLoad: PropTypes.func
}

export default connect(
  'selectAvailableGatewayUrl',
  'doFilesFetch',
  FileThumbnail
)
