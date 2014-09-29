var React = require('react')
var code = React.DOM.code

var t = module.exports = {}
t.addr = function(addr) {
  return code({className: "webui-address"}, addr)
}
