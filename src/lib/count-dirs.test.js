/* global it, expect */
import countDirs from './count-dirs.js'

it('should return 1 for the root dir', () => {
  expect(countDirs([{ path: '/' }])).toBe(1)
})

it('should return 2 for the root dir with a sub dir', () => {
  expect(countDirs([{ path: '/foo/x' }])).toBe(2)
})

it('should return 1 for the root dir with an extentionless file', () => {
  expect(countDirs([{ path: '/foo' }])).toBe(1)
})

it('should return 0 for if files is empty', () => {
  expect(countDirs([])).toBe(0)
})

it('should return 0 for if files is missing', () => {
  expect(countDirs()).toBe(0)
})

it('should return 0 for a file name', () => {
  expect(countDirs([{ path: 'Master layout FINAL v18(2).pdf' }])).toBe(0)
})

it('should deal with relative paths', () => {
  expect(countDirs([{ path: 'home/www/index.html' }])).toBe(2)
})

it('should count the unique dirs in a list of file objects', () => {
  const files = [
    { path: '/foo/bar/foo.txt' },
    { path: '/foo/bar/odd.txt' },
    { path: '/foo/other/odd.txt' },
    { path: '/foo/zoom/x.txt' },
    { path: '/aaa/other/y.txt' },
    { path: '/aaa/bar/y.txt' }
  ]

  expect(countDirs(files)).toBe(8)
})
