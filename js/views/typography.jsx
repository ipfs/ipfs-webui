var React = require('react')

var t = module.exports = {}
t.addr = function (addr) {
  return <code className='webui-address'>{addr}</code>
}
