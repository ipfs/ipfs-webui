export default class Path {
  constructor (protocol, name, path) {
    this.protocol = protocol
    this.name = name
    this.path = path
  }

  parent () {
    var slashIdx = this.path.lastIndexOf('/')
    if (slashIdx === -1) return null
    return new Path(this.protocol, this.name, this.path.substr(0, slashIdx))
  }

  append (fragment) {
    if (fragment[0] !== '/') {
      fragment = '/' + fragment
    }
    return new Path(this.protocol, this.name, this.path + fragment)
  }

  toString () {
    return '/' + this.protocol + '/' + this.name + this.path
  }

  urlify () {
    return this.toString().replace(/[\/]/g, '\\')
  }
}

export function parse (string) {
  if (!string) return null
  if (string[0] === '\\') {
    string = string.replace(/[\\]/g, '/')
  }
  var proto, name, path
  var parts = string.split('/')

  if (!parts[0]) {
    proto = parts[1]
    name = parts[2]
    path = parts.slice(3).join('/')
  } else {
    proto = 'ipfs'
    name = parts[0]
    path = parts.slice(1).join('/')
  }
  if (path) {
    path = '/' + path
  }

  return new Path(proto, name, path)
}
