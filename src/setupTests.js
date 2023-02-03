import * as enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { createRequire } from 'module'

const { configure } = enzyme.default
configure({ adapter: new Adapter() })

const require = createRequire(import.meta.url)
globalThis.TextDecoder = global.TextDecoder = require('util').TextDecoder
globalThis.TextEncoder = global.TextEncoder = require('util').TextEncoder
