import { getConfiguredCache } from 'money-clip'
import ms from 'milliseconds'

export default getConfiguredCache({
  name: 'ipfs-webui',
  maxAge: ms.months(1),
  version: 1
})
