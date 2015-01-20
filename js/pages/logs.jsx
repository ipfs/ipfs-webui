var React = require('react')

module.exports = React.createClass({
  render: function() {
    var url = 'http://' + this.props.host + '/api/v0/log/read?enc=text'
    return (
    <div className="row">
      <div className="col-sm-10 col-sm-offset-1">
        <h3>Event Log</h3>
        <br/>
        <iframe className="panel panel-default padded" src={url} style={{height: '600px', width: '100%'}}></iframe>
      </div>
    </div>
    )
  }
})
