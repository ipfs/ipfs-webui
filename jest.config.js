/** @type {import('jest').Config} */
const config = {
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test/e2e'
  ],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/setupTests.js', 'fake-indexeddb/auto'],
  moduleNameMapper: {
    // ...config.moduleNameMapper,
    '^dnd-core$': 'dnd-core/dist/cjs',
    '^react-dnd$': 'react-dnd/dist/cjs',
    '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
    'multiformats/basics': '<rootDir>/node_modules/multiformats/dist/src/basics.js',
    'multiformats/bases/base32': '<rootDir>/node_modules/multiformats/dist/src/bases/base32.js',
    'multiformats/bases/base58': '<rootDir>/node_modules/multiformats/dist/src/bases/base58.js',
    'multiformats/cid': '<rootDir>/node_modules/multiformats/dist/src/cid.js',
    'multiformats/hashes/digest': '<rootDir>/node_modules/multiformats/dist/src/hashes/digest.js',
    'multiformats/hashes/sha2': '<rootDir>/node_modules/multiformats/dist/src/hashes/sha2.js',
    'uint8arrays/alloc': '<rootDir>/node_modules/uint8arrays/dist/src/alloc.js',
    'uint8arrays/concat': '<rootDir>/node_modules/uint8arrays/dist/src/concat.js',
    'uint8arrays/equals': '<rootDir>/node_modules/uint8arrays/dist/src/equals.js',
    'uint8arrays/from-string': '<rootDir>/node_modules/uint8arrays/dist/src/from-string.js',
    'uint8arrays/to-string': '<rootDir>/node_modules/uint8arrays/dist/src/to-string.js',
    '@chainsafe/is-ip/parse': '<rootDir>/node_modules/@chainsafe/is-ip/lib/parse.js',
    eventemitter3: '<rootDir>/node_modules/eventemitter3/dist/eventemitter3.esm.js',
    'cheerio/lib/utils': '<rootDir>/node_modules/cheerio/dist/commonjs/utils.js',
    '@ipld/dag-pb': '<rootDir>/node_modules/@ipld/dag-pb/src/index.js',
    '@multiformats/multiaddr': '<rootDir>/node_modules/@multiformats/multiaddr/dist/src/index.js',
    multiformats: '<rootDir>/node_modules/multiformats/dist/src/index.js',
    'uint8-varint': '<rootDir>/node_modules/uint8-varint/dist/src/index.js',
    '@chainsafe/netmask': '<rootDir>/node_modules/@chainsafe/netmask/dist/src/index.js',
    '@chainsafe/is-ip': '<rootDir>/node_modules/@chainsafe/is-ip/lib/is-ip.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] }]
  },
  transformIgnorePatterns: [
    '^.+\\.module\\.(css|sass|scss)$' // default
  ]
}

export default config
