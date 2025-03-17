import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import typeFromExt from '../type-from-ext/index.js'
import './file-thumbnail.css'

const FileThumbnail = ({ name, cid, availableGatewayUrl, textPreview, onLoad }) => {
  const [error, setError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const type = typeFromExt(name)

  const handleImageError = useCallback(() => {
    setError(true)
    setImageLoaded(false)
    setIsLoading(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  useEffect(() => {
    setImageLoaded(false)
    setError(false)
    setIsLoading(false)
  }, [cid, name])

  if (error || (!textPreview && !type.startsWith('image'))) {
    return null
  }

  if (type === 'image') {
    const src = `${availableGatewayUrl}/ipfs/${cid}?filename=${encodeURIComponent(name)}`
    return (
      <div className={`file-thumbnail ${!imageLoaded || isLoading ? 'is-loading' : ''}`}>
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

  if (textPreview) {
    return (
      <div className={`file-thumbnail file-thumbnail-text ${(isLoading || textPreview.length === 0) ? 'is-loading' : ''}`}>
        <div className="file-thumbnail-loading" />
        <pre className="file-thumbnail-content">
          {textPreview}
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
  textPreview: PropTypes.string,
  onLoad: PropTypes.func
}

export default connect(
  'selectAvailableGatewayUrl',
  FileThumbnail
)
