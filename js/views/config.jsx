var React = require('react')
var addr = require('./typography.jsx').addr

function format(value) {
  var s = JSON.stringify(value).trim()
  if(s.length > 600) s = s.substr(0, 597) + '...'
  return s
}

module.exports = React.createClass({

  render: function() {
    var body = []
    for(var key in this.props) {
      var value = this.props[key]
      console.log(key, value)

      var list = []
      if(Array.isArray(value)) {
        value.forEach(function(v) {
          list.push(<li className="list-group-item webui-config-item">{format(v)}</li>)
        })

      } else if(typeof value === 'object') {
        for(var key2 in value) {
          list.push(
            <li className="list-group-item webui-config-item">
              <strong>{key2}:</strong>&nbsp;&nbsp;
              <span>{format(value[key2])}</span>
            </li>
          )
        }

      } else {
        list = format(value)
      }

      body.push(
        <div>
          <h4><strong>{key}</strong></h4>
          <ul className="list-group">
            {list}
          </ul>
        </div>
      )
    }

    return (
      <div className="webui-config">
        <h3>Config</h3>
        <br/>
        {body}
      </div>
    )
  }
})
