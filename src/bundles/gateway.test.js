/* global describe, it, expect */
import { localGatewayToKuboGateway, checkValidHttpUrl } from './gateway.js'

describe('localGatewayToKuboGateway', () => {
  it('keeps an explicit port and treats http as insecure', () => {
    expect(localGatewayToKuboGateway('http://127.0.0.1:8080')).toEqual({
      host: '127.0.0.1',
      port: '8080',
      protocol: 'http',
      trustlessBlockBrokerConfig: { init: { allowLocal: true, allowInsecure: true } }
    })
  })

  it('defaults the port to 443 for https and keeps it secure', () => {
    expect(localGatewayToKuboGateway('https://ipfs.example.com')).toEqual({
      host: 'ipfs.example.com',
      port: '443',
      protocol: 'https',
      trustlessBlockBrokerConfig: { init: { allowLocal: true, allowInsecure: false } }
    })
  })

  it('defaults the port to 80 for http without an explicit port', () => {
    expect(localGatewayToKuboGateway('http://gateway.local').port).toBe('80')
  })

  it('throws on an invalid URL', () => {
    expect(() => localGatewayToKuboGateway('not a url')).toThrow()
  })
})

describe('checkValidHttpUrl', () => {
  it('accepts http and https URLs, including non-default ports', () => {
    expect(checkValidHttpUrl('http://127.0.0.1:8080')).toBe(true)
    expect(checkValidHttpUrl('https://ipfs.example.com')).toBe(true)
  })

  it('rejects non-http(s) and malformed values', () => {
    expect(checkValidHttpUrl('ftp://example.com')).toBe(false)
    expect(checkValidHttpUrl('not a url')).toBe(false)
    expect(checkValidHttpUrl('')).toBe(false)
  })
})
