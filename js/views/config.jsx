var React = require('react')
var addr = require('./typography.jsx').addr
var Editable = require('./editable.jsx')

function convertToInput(e) {
  var target = $(e.target)
  if(target.hasClass('webui-editable-input')) return

  var text = target.attr('data-data')
  var input = $('<input type="text" class="form-control webui-editable-input">')
  if(text.length > 110) input = $('<textarea class="webui-editable-input" cols="100" rows="10">')

  input.val(text)
  target.replaceWith(input)

  var interval = setInterval(function() {
    if(convertToText({target: input})) clearInterval(interval)
  }, 40)
}

function convertToText(e) {
  var input = $(e.target)
  if(!input.hasClass('webui-editable-input')) return false
  if(input.is(':active') || input.is(':hover') || input.is(':focus')) return false

  var text = $('<div class="webui-editable">')
    .text(format(input.val()))
    .attr('data-data', input.val())
    .mouseover(convertToInput)
    .mouseout(convertToText)

  input.replaceWith(text)
  return true
}

function format(value) {
  value = value.trim()
  if(value.length > 600) value = value.substr(0, 597) + '...'
  return value
}

function editable(key, value) {
  value = JSON.stringify(value).trim()

  return (
    <div>
      <div className="webui-editable" data-data={value} data-key={key} onMouseOver={convertToInput} onMouseOut={convertToText}>
        {format(value)}
      </div>
    </div>
  )
}

module.exports = React.createClass({

  render: function() {
    var body = []
    for(var key in this.props.config) {
      var value = this.props.config[key]
      var inner

      if(typeof value === 'object' && !Array.isArray(value)) {
        var list = []
        for(var key2 in value) {
          list.push(
            <li className="list-group-item webui-config-item">
              <strong>{key2}:</strong>&nbsp;&nbsp;
              <span>{Editable({
                key: key+'.'+key2,
                value: value[key2],
                ipfs: this.props.ipfs
              })}</span>
            </li>
          )
        }

        inner = <ul className="list-group">{list}</ul>

      } else {
        inner = <div className="panel panel-default padded">
          {Editable({
            key: key,
            value: value,
            ipfs: this.props.ipfs
          })}
        </div>
      }

      body.push(
        <div>
          <h4><strong>{key}</strong></h4>
          {inner}
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
