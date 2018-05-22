/* global it expect */
import { findIpldLinks } from './dag'

it('finds minimal ipld links', () => {
  const minimal = {
    '/': 'zdpuAzR6UUgm6FLcpUVPH2U2JGteR8rLrM57BzZqJPnjAmTy4'
  }
  const res = findIpldLinks(minimal)
  expect(res.length).toBe(1)
  expect(res[0].name).toBe('')
  expect(res[0].multihash).toBe(minimal['/'])
})

it('finds nested ipld links', () => {
  const nested = {
    a: {
      b: {
        c: {
          '/': 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW'
        }
      }
    }
  }
  const res = findIpldLinks(nested)
  expect(res.length).toBe(1)
  expect(res[0].name).toBe('a/b/c')
  expect(res[0].multihash).toBe(nested.a.b.c['/'])
})

it('finds multiple ipld links', () => {
  const multiple = {
    a: {
      '/': 'zdpuAzR6UUgm6FLcpUVPH2U2JGteR8rLrM57BzZqJPnjAmTy4'
    },
    b: {
      'foo': 'bar'
    },
    c: {
      '/': 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW'
    }
  }
  const res = findIpldLinks(multiple)
  expect(res.length).toBe(2)
  expect(res[0].name).toBe('a')
  expect(res[0].multihash).toBe(multiple.a['/'])
  expect(res[1].name).toBe('c')
  expect(res[1].multihash).toBe(multiple.c['/'])
})

it('finds ipld links in arrays', () => {
  const arr = [
    {
      '/': 'zdpuAzR6UUgm6FLcpUVPH2U2JGteR8rLrM57BzZqJPnjAmTy4'
    },
    {
      nope: true
    },
    {
      '/': 'zdpuAzR6UUgm6FLcpUVPH2U2JGteR8rLrM57BzZqJPnjAmTy4'
    },
    'nope'
  ]
  const res = findIpldLinks(arr)
  expect(res.length).toBe(2)
  expect(res[0].name).toBe('0')
  expect(res[0].multihash).toBe(arr[0]['/'])
  expect(res[1].name).toBe('2')
  expect(res[1].multihash).toBe(arr[2]['/'])
})
