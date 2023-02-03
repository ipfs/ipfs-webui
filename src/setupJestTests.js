import { createRequire } from 'module'

const require = createRequire(import.meta.url)
globalThis.TextDecoder = global.TextDecoder = require('util').TextDecoder
globalThis.TextEncoder = global.TextEncoder = require('util').TextEncoder
