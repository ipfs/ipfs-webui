/* global it expect */
import { isPathInThisNode, findFirstLinkInPath } from './cbor'

it('handles nested ipld links', () => {
  const nested = {
    a: {
      b: {
        c: {
          '/': 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW'
        }
      }
    }
  }
  expect(isPathInThisNode(nested, '')).toBe(true)
  expect(isPathInThisNode(nested, '/')).toBe(true)
  expect(isPathInThisNode(nested, '/a')).toBe(true)
  expect(isPathInThisNode(nested, '/a/b')).toBe(true)
  // "c" resolves to it's link target QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW, not this node.
  expect(isPathInThisNode(nested, '/a/b/c')).toBe(false)
})

it('handles arrays ipld links', () => {
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
  expect(isPathInThisNode(arr, '')).toBe(true)
  expect(isPathInThisNode(arr, '/')).toBe(true)
  // "0" resolves to it's link target, not this node.
  expect(isPathInThisNode(arr, '/0')).toBe(false)
  expect(isPathInThisNode(arr, '/1')).toBe(true)
  // "2" resolves to it's link target, not this node.
  expect(isPathInThisNode(arr, '/2')).toBe(false)
})

it('finds links in nested ipld paths', () => {
  const nested = {
    a: {
      b: {
        c: {
          '/': 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW'
        }
      }
    }
  }
  expect(findFirstLinkInPath(nested, '')).toBe(null)
  expect(findFirstLinkInPath(nested, '/')).toBe(null)
  expect(findFirstLinkInPath(nested, '/a')).toBe(null)
  expect(findFirstLinkInPath(nested, '/a/b')).toBe(null)
  // "c" resolves to it's link target QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW, not this node.
  expect(findFirstLinkInPath(nested, '/a/b/c')).toBe('QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW')
})
