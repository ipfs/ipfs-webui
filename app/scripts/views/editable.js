var React = require('react')
var $ = require('jquery')

function format (value) {
  value = value.trim()
  if (value.length > 600) value = value.substr(0, 597) + '...'
  return value
}

var Editable = React.createClass({
  displayName: 'Editable',
  propTypes: {
    ipfs: React.PropTypes.object,
    key: React.PropTypes.any,
    value: React.PropTypes.string
  },
  getInitialState: function () {
    this.props.value = JSON.stringify(this.props.value).trim()
    return {}
  },

  convertToInput: function (e) {
    var target = $(e.target)
    if (target.hasClass('webui-editable-input')) return

    var text = this.props.value
    var input = $('<input type="text" class="form-control webui-editable-input">')
    if (text.length > 110) input = $('<textarea class="webui-editable-input" cols="100" rows="10">')

    input.val(text)
    target.replaceWith(input)

    var interval = setInterval(function () {
      if (this.convertToText({target: input})) clearInterval(interval)
    }.bind(this), 40)
  },

  convertToText: function (e) {
    var input = $(e.target)
    if (!input.hasClass('webui-editable-input')) return false
    if (input.is(':active') || input.is(':hover') || input.is(':focus')) return false

    if (this.props.value !== input.val()) {
      this.submit(input.val())
    }

    var text = $('<div class="webui-editable">')
      .text(format(input.val()))
      .mouseover(this.convertToInput)
      .mouseout(this.convertToText)

    input.replaceWith(text)

    return true
  },

  submit: function (value) {
    this.props.value = value
    console.log(value)

    this.props.ipfs.config.set(this.props.key, value, function (err, res) {
      console.log(err, res)
    })
  },

  render: function () {
    return (
      <div>
        <div className='webui-editable' onMouseOver={this.convertToInput} onMouseOut={this.convertToText}>
          {format(this.props.value)}
        </div>
      </div>
    )
  }
})

module.exports = Editable
