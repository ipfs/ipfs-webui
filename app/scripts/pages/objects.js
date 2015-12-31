import React from 'react'
import Router from 'react-router'
import $ from 'jquery'
import ObjectView from '../views/object'
import {parse} from '../utils/path.js'
import i18n from '../utils/i18n.js'
import {Row, Col, Button} from 'react-bootstrap'

export default React.createClass({
  displayName: 'Objects',
  propTypes: {
    gateway: React.PropTypes.string
  },
  mixins: [ Router.State ],

  componentDidMount: function () {
    window.addEventListener('hashchange', this.updateState)
  },

  componentWillUnmount: function () {
    window.removeEventListener('hashchange', this.updateState)
  },

  getStateFromRoute: function () {
    var params = this.context.router.getCurrentParams()
    var state = {}
    if (params.path) {
      var path = parse(params.path)
      state.path = path
      this.getObject(state.path)
      state.pathInput = path.toString()
    }
    // reset between reloads
    return state
  },

  updateState: function () {
    this.setState(this.getStateFromRoute())
  },

  getInitialState: function () {
    return this.getStateFromRoute()
  },

  getObject: function (path) {
    var t = this
    t.props.ipfs.object.get(path.toString(), function (err, res) {
      if (err) return t.setState({ error: err })
      t.setState({ object: res,
                   permalink: null})
      if (path.protocol === 'ipns') {
        // also resolve the name
        t.props.ipfs.name.resolve(path.name, function (err, resolved) {
          if (err) return t.setState({ error: err })
          var permalink = parse(resolved.Path).append(path.path)
          t.setState({ permalink: permalink })
        })
      }
    })
  },

  updatePath: function (e) {
    var path = $(e.target).val().trim()
    this.setState({ pathInput: path })
  },

  update: function (e) {
    if (e.which && e.which !== 13) return
    var params = this.context.router.getCurrentParams()
    params.path = parse(this.state.pathInput).urlify()
    this.context.router.transitionTo('objects', params)
  },

  render: function () {
    var error = this.state.error
      ? <div className='row'>
          <h4>{i18n.t('Error')}</h4>
          <div className='panel panel-default padded'>
            {this.state.error.Message}
          </div>
        </div>
      : null

    // TODO add provider-view here
    var views = {
      object: (!error && this.state.object
        ? <div className='row'>
            <div className='col-xs-12'>
              <ObjectView
                object={this.state.object}
                path={this.state.path}
                permalink={this.state.permalink}
                gateway={this.props.gateway} />
            </div>
          </div>
        : null)
    }

    var params = this.context.router.getCurrentParams()
    var tab = params.tab

    return (
      <Row>
        <Col sm={10} smOffset={1} className={'webui-dag'}>
          <Row>
            <h4>{i18n.t('Enter hash or path')}</h4>
            <Row className='path'>
              <Col xs={10}>
                <input type='text' className='form-control input-lg' onChange={this.updatePath} onKeyPress={this.update} value={this.state.pathInput} placeholder={i18n.t('Enter hash or path: /ipfs/QmBpath...')}/>
              </Col>
              <Col xs={2}>
                <Button bsStyle={'primary'} className={'go'}
                        onClick={this.update}>
                  {i18n.t('GO')}
                </Button>
              </Col>
            </Row>
          </Row>
          {error}
          {views[tab]}
        </Col>
      </Row>
    )
  }
})
