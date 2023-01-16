
/**
 * @see https://github.com/ipfs/ipfs-webui/issues/2078#issuecomment-1384444232
 * @returns {Promise<'local'|'kubo'|'webui.ipfs'>}
 */
export async function getDeploymentEnv () {
  try {
    const response = await fetch('/webui', { method: 'HEAD' })
    if (response.redirected) {
      /**
       * @see https://github.com/ipfs/kubo/blob/f54b2bcf6061219f7f481e8660e6707ae3bc3c38/cmd/ipfs/daemon.go#L677
       * @see https://github.com/ipfs/kubo/blob/15093a00116ecf6b550023155f31a33f4bba6403/core/corehttp/webui.go#L57
       */
      return 'kubo'
    }
    return 'local'
  } catch {
    return 'webui.ipfs'
  }
}
