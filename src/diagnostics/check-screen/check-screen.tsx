import React, { useRef, useEffect, useMemo } from 'react'
import { useDebouncedCallback } from '../../lib/hooks/use-debounced-callback'
import { useBridgeSelector } from '../../helpers/context-bridge'
import { RouteInfo } from '../../bundles/routes-types'

const CheckScreen: React.FC = () => {
  const ref = useRef<HTMLIFrameElement>(null)
  const routeInfo = useBridgeSelector<RouteInfo>('selectRouteInfo')
  // pass through IPFS check query params.
  const checkIframeUrl = useMemo(() => {
    if (routeInfo == null) {
      return 'https://check.ipfs.network/'
    }
    const url = new URL(routeInfo.url.replace('/diagnostics/check', ''), 'https://check.ipfs.network/')

    return url.toString()
  }, [routeInfo])

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

  return (
    <iframe
      ref={ref}
      className="db bn w-100 overflow-y-hidden overflow-x-hidden"
      title="Check Screen"
      src={checkIframeUrl}
    />
  )
}

export default CheckScreen
