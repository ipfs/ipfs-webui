import React, { useRef, useEffect } from 'react'
import { useDebouncedCallback } from '../../lib/hooks/use-debounced-callback'

interface CheckScreenProps {
  cid?: string
}

const CheckScreen: React.FC<CheckScreenProps> = ({ cid }) => {
  const ref = useRef<HTMLIFrameElement>(null)

  const requestSize = useDebouncedCallback(() => {
    const iframe = ref.current
    if (!iframe) return
    ref.current?.contentWindow?.postMessage({ type: 'iframe-size:request' }, '*')
  }, 100)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return

    const onMsg = (e: MessageEvent<any>) => {
      if (e.data?.type !== 'iframe-size:report') return
      iframe.style.height = `${e.data.height}px`
    }
    const onLoad = () => requestSize()

    window.addEventListener('message', onMsg)
    window.addEventListener('resize', requestSize)
    iframe.addEventListener('load', onLoad)

    // intial size request since the iframe ref is available.
    requestSize()

    return () => {
      window.removeEventListener('message', onMsg)
      window.removeEventListener('resize', requestSize)
      iframe.removeEventListener('load', onLoad)
    }
  }, [requestSize])

  // Build the iframe URL with optional CID parameter
  const baseUrl = 'https://check.ipfs.network/' // TODO: make configurable via Settings screen
  const iframeSrc = cid ? `${baseUrl}?cid=${encodeURIComponent(cid)}` : baseUrl

  return (
    <iframe
      ref={ref}
      className="db bn w-100 overflow-y-hidden overflow-x-hidden"
      title="Check Screen"
      src={iframeSrc}
    />
  )
}

export default CheckScreen
