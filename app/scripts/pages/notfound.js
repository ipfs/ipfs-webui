var React = require('react')
var Row = require('react-bootstrap').Row
var Col = require('react-bootstrap').Col
var i18n = require('../utils/i18n.js')

export default React.createClass({
  displayName: 'NotFound',
  render: function () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>

          <h1>{i18n.t('404 - Not Found')}</h1>

          <p><a href='#/'>{i18n.t('Go to console home')}</a></p>

        </Col>
      </Row>
    )
  }
})
