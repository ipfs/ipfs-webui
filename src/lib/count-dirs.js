import { dirname } from 'path'

/**
* countDirs: find all the dirs that will be created from a list of paths.
*
* files is an array of file objects as passed to ipfs.added
* The root dir is counted, and All entries are assumed to be file paths,
* `/foo` is assumed to be a file `foo` with no extention in the root dir,
* which would be counted as 1 unigue dir by this function.
*
* ```js
* files = [
*   { path: '/foo/bar/foo.txt', ... }
*   { path: '/foo/bar/odd', ... }
* ]
* countDirs(files) === 3
* // ['/', '/foo', '/foo/bar']
* ```
*
* We need to calculat how many directories are in the tree.
*
* See: https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add
* @param {{path:string}[]} files
* @returns {number}
*/
function countDirs (files) {
  if (!files || !files.length) return 0
  const paths = files.map(f => f.path)
    .filter(p => !!p)

  // [ /foo/bar, /foo/other, /foo/zoom, /aaa/other ]
  const directories = new Set()
  paths.forEach(path => findUniqueDirectories(path, directories))
  return directories.size
}

/**
 *
 * @param {string} path
 * @param {Set<string>} [res]
 * @returns {Set<string>}
 */
function findUniqueDirectories (path, res = new Set()) {
  if (!path) return res
  const name = dirname(path)
  if (name === '.') return res
  res.add(name)
  if (name === '/') return res
  return findUniqueDirectories(name, res)
}

export default countDirs
