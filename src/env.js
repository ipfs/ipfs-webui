/**
 * @see https://github.com/ipfs/ipfs-webui/issues/2078#issuecomment-1384444232
 * @see https://github.com/ipfs/ipfs-webui/issues/2078#issuecomment-1384605253
 * @returns {Promise<'local'|'kubo'|'webui.ipfs'>}
 */

const webuiRegex = /webui[-.]ipfs/
const localhostRegex = /(?:localhost|127.0.0.1)/
const ipfsRegex = /ipfs/
export async function getDeploymentEnv () {
  const { origin } = globalThis.location
  if (webuiRegex.test(origin)) {
    return localhostRegex.test(origin) ? 'local' : 'webui.ipfs'
  }
  try {
    const response = await fetch('/webui', { method: 'HEAD' })
    const { pathname } = new URL(response.url)
    if (response.redirected && ipfsRegex.test(pathname)) {
      /**
       * @see https://github.com/ipfs/kubo/blob/f54b2bcf6061219f7f481e8660e6707ae3bc3c38/cmd/ipfs/daemon.go#L677
       * @see https://github.com/ipfs/kubo/blob/15093a00116ecf6b550023155f31a33f4bba6403/core/corehttp/webui.go#L57
       */
      return 'kubo'
    }
  } catch {
    // dont throw from this method
  }
  return localhostRegex.test(origin) ? 'local' : 'webui.ipfs'
}
