var React = require('react')
var i18n = require('../utils/i18n.js')

export default React.createClass({
  displayName: 'NotFound',
  render: function () {
    return (
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1'>

          <h1>{i18n.t('404 - Not Found')}</h1>

          <p><a href='#/'>{i18n.t('Go to console home')}</a></p>

        </div>
      </div>
    )
  }
})
