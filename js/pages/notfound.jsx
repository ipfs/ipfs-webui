var React = require('react')

var NotFound = React.createClass({
  displayName: 'NotFound',
  render: function () {
    return (
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1'>

          <h1>404 - Not Found</h1>

          <p><a href='#/'>Go to console home</a></p>

        </div>
      </div>
    )
  }
})

module.exports = NotFound
