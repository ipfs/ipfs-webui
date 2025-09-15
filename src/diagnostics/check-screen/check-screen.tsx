import React, { useRef, useEffect, useState } from 'react'
import { connect } from 'redux-bundler-react'
import { useDebouncedCallback } from '../../lib/hooks/use-debounced-callback'
import { DEFAULT_IPFS_CHECK_URL } from '../../bundles/gateway.js'

interface CheckScreenProps {
  cid?: string
  ipfsCheckUrl?: string
}

const CheckScreen: React.FC<CheckScreenProps> = ({ cid, ipfsCheckUrl }) => {
  const ipfsCheckBaseUrl = ipfsCheckUrl || DEFAULT_IPFS_CHECK_URL
  const baseUrl = ipfsCheckBaseUrl.endsWith('/') ? ipfsCheckBaseUrl : `${ipfsCheckBaseUrl}/`
  const ipfsCheckOrigin = new URL(baseUrl).origin
  const ref = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  const requestSize = useDebouncedCallback(() => {
    const iframe = ref.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage({ type: 'iframe-size:request' }, ipfsCheckOrigin)
  }, 100)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return

    const onMsg = (e: MessageEvent<any>) => {
      // Validate origin to prevent XSS attacks
      if (e.origin !== ipfsCheckOrigin) return
      if (e.data?.type !== 'iframe-size:report') return

      // Hide loading message as soon as we get first message from iframe
      setIsLoading(false)

      // Update iframe height based on content
      iframe.style.height = `${e.data.height}px`
    }
    const onLoad = () => {
      setIsLoading(false)
      requestSize()
    }

    window.addEventListener('message', onMsg)
    window.addEventListener('resize', requestSize)
    iframe.addEventListener('load', onLoad)

    // initial size request since the iframe ref is available.
    requestSize()

    return () => {
      window.removeEventListener('message', onMsg)
      window.removeEventListener('resize', requestSize)
      iframe.removeEventListener('load', onLoad)
    }
  }, [requestSize, ipfsCheckOrigin])

  // Build the iframe URL with optional CID parameter
  const iframeSrc = cid ? `${baseUrl}?cid=${encodeURIComponent(cid)}` : baseUrl

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute w-100 mt4 tc charcoal-muted f5 z-1" role="status" aria-live="polite">
          <p className="ma0 sans-serif">Loading retrieval check...</p>
        </div>
      )}
      <iframe
        ref={ref}
        className="db bn w-100 overflow-y-hidden overflow-x-hidden"
        style={{ height: '80vh' }}
        title={`ipfs-check @ ${baseUrl}`}
        src={iframeSrc}
        aria-busy={isLoading}
        // Sandbox permissions:
        // - allow-scripts: needed for check functionality
        // - allow-forms: needed for the check form submission
        // - allow-same-origin: needed for postMessage communication to work properly
        sandbox="allow-scripts allow-forms allow-same-origin"
      />
    </div>
  )
}

export default connect(
  'selectIpfsCheckUrl',
  CheckScreen
)
