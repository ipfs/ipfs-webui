import React, {Component} from 'react'
import {Row, Col} from 'react-bootstrap'
import {Route, Switch, Redirect} from 'react-router'

import Explorer from './files/explorer'
import Preview from './files/preview'

class Files extends Component {
  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <Switch>
            <Redirect exact from='/files' to='/files/explorer' />
            <Route path='/files/preview/(.*)?' component={Preview} />
            <Route path='/files/explorer/(.*)?' component={Explorer} />
          </Switch>
        </Col>
      </Row>
    )
  }
}

export default Files
