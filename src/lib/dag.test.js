/* global it expect */
import { findDagCborLinks } from './dag'

it('finds minimal ipld links', () => {
  const minimal = {
    '/': 'zdpuAzR6UUgm6FLcpUVPH2U2JGteR8rLrM57BzZqJPnjAmTy4'
  }
  const res = findDagCborLinks(minimal)
  expect(res.length).toBe(1)
  expect(res[0].path).toBe('')
  expect(res[0].target).toBe(minimal['/'])
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
  const res = findDagCborLinks(nested)
  expect(res.length).toBe(1)
  expect(res[0].path).toBe('a/b/c')
  expect(res[0].target).toBe(nested.a.b.c['/'])
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
  const res = findDagCborLinks(multiple)
  expect(res.length).toBe(2)
  expect(res[0].path).toBe('a')
  expect(res[0].target).toBe(multiple.a['/'])
  expect(res[1].path).toBe('c')
  expect(res[1].target).toBe(multiple.c['/'])
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
  const res = findDagCborLinks(arr)
  expect(res.length).toBe(2)
  expect(res[0].path).toBe('0')
  expect(res[0].target).toBe(arr[0]['/'])
  expect(res[1].path).toBe('2')
  expect(res[1].target).toBe(arr[2]['/'])
})
