
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// import { TextDecoder, TextEncoder } from 'node:util'

globalThis.TextDecoder = global.TextDecoder = require('util').TextDecoder
globalThis.TextEncoder = global.TextEncoder = require('util').TextEncoder
