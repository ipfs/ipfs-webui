var React = require('react')

module.exports = React.createClass({
  clear: function() {
    var t = this
    var iframe = $(this.getDOMNode()).find('iframe').get(0)
    iframe.contentWindow.location = 'about:blank'
    setTimeout(function(){
      iframe.contentWindow.location = t.getUrl()
    }, 10)
  },

  scrollToBottom: function() {
    var iframe = $(this.getDOMNode()).find('iframe').get(0)
    iframe.contentWindow.scrollTo(0, Infinity)
  },

  getUrl: function() {
    return 'http://' + this.props.host + '/api/v0/log/tail?enc=text'
  },

  render: function() {
    return (
    <div className="row">
      <div className="col-sm-10 col-sm-offset-1 webui-logs">
        <h3>Event Log</h3>
        <div className="actions">
          <button className="btn btn-info" onClick={this.clear}>Clear</button>
          <button className="btn btn-second" onClick={this.scrollToBottom}>Bottom</button>
        </div>
        <br/>
        <iframe className="panel panel-default padded" src={this.getUrl()} style={{height: '600px', width: '100%'}}></iframe>
      </div>
    </div>
    )
  }
})
