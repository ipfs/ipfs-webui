import React, {Component} from 'react'
import {Row, Col} from 'react-bootstrap'
import i18n from '../utils/i18n.js'
import {Link} from 'react-router'

export
default class NotFound extends Component {
  static displayName = 'NotFound';
  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <h1>{i18n.t('404 - Not Found')}</h1>
          <p>
            <Link to='/'>
              {i18n.t('Go to console home')}
            </Link>
          </p>
        </Col>
      </Row>
    )
  }
}
