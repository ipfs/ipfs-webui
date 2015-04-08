var React = require('react')
var $ = require('jquery')
var ZeroClipboard = require('zeroclipboard')

module.exports = React.createClass({
  getInitialState: function () {
    return { clicked: false }
  },

  componentDidMount: function () {
    new ZeroClipboard($(this.getDOMNode())) // eslint-disable-line
    $(this.getDOMNode()).tooltip()
  },

  updateTooltip: function (clicked) {
    var el = $(this.getDOMNode())
    var tooltip = !clicked ? (this.props.tooltip || 'Copy to clipboard') : (this.props.tooltipClicked || 'Copied!')
    el.attr('title', tooltip).tooltip('fixTitle')
    if (el.hasClass('zeroclipboard-is-hover')) el.tooltip('show')
    $(el.attr('aria-describedby')).text(tooltip)
  },

  onClick: function (e) {
    e.preventDefault()
    this.setState({ clicked: true })
    this.updateTooltip(true)

    var t = this
    setTimeout(function () {
      t.setState({ clicked: false })
      t.updateTooltip(false)
    }, 3000)
  },

  render: function () {
    return (
      <a href="#" className={'copier' + (this.state.clicked ? ' disabled' : '')}
          data-clipboard-text={this.props.copyText} onClick={this.onClick} data-toggle="tooltip"
          data-placement="bottom" title="Copy to clipboard">
        {this.props.children || 'Copy to clipboard'}
      </a>
    )
  }
})
