import React from 'react'
import PropTypes from 'prop-types'
import ObjectView from '../components/object'
import {parse} from '../utils/path'
import {join} from 'path'
import i18n from '../utils/i18n'
import {Row, Col, Button} from 'react-bootstrap'
import {withIpfs} from '../components/ipfs'

class Objects extends React.Component {
  constructor (props) {
    super(props)
    const {match, ipfs} = props
    this.state = this._getStateFromRoute(match.params, ipfs)
  }

  _getStateFromRoute = (params, ipfs) => {
    let state = {}
    if (params[0]) {
      const path = parse(join('/', params[0]))
      state.path = path
      this._getObject(ipfs, state.path)
      state.pathInput = path.toString()
    }
    // reset between reloads
    return state
  }

  _updateState = () => {
    const {match, ipfs} = this.props
    this.setState(this._getStateFromRoute(match.params, ipfs))
  };

  _getObject = (ipfs, path) => {
    const p = path.toString().replace(/^\/ipfs\//, '')
    ipfs.object.get(p).then((object) => {
      this.setState({ permalink: null, object: object })

      if (path.protocol === 'ipns') {
        // also resolve the name
        return ipfs.name.resolve(path.name).then((resolved) => {
          const permalink = parse(resolved.path).append(path.path)
          this.setState({ permalink: permalink })
        })
      }
    }).catch((error) => this.setState({error}))
  };

  _update = (event) => {
    if (event.which && event.which !== 13) {
      return
    }
    const params = this.props.match.params
    params.path = parse(this.state.pathInput).urlify()

    let route = '/objects'
    if (params.path) {
      route += params.path
    }

    if ('#' + route !== window.location.hash) {
      this.context.router.history.push(route)
    }
  }

  componentDidMount () {
    this.mounted = true
    window.addEventListener('hashchange', this._updateState)
  }

  componentWillUnmount () {
    this.mounted = false
    window.removeEventListener('hashchange', this._updateState)
  }

  render () {
    const error = this.state.error ? (<div className='row'>
      <h4>{i18n.t('Error')}</h4>
      <div className='panel panel-default padded'>
        {this.state.error}
      </div>
    </div>) : null

    // TODO add provider-view here
    const views = (!error && this.state.object ? <div className='row'>
      <div className='col-xs-12'>
        <ObjectView
          object={this.state.object}
          path={this.state.path}
          permalink={this.state.permalink}
          gateway={this.props.gateway} />
      </div>
    </div> : null)

    return (
      <Row>
        <Col sm={10} smOffset={1} className={'webui-dag'}>
          <Row>
            <h4>{i18n.t('Enter a hash')}</h4>
            <Row className='path'>
              <Col xs={10}>
                <input
                  type='text'
                  className='form-control input-lg'
                  onChange={(event) => this.setState({pathInput: event.target.value.trim()})}
                  onKeyPress={this._update}
                  value={this.state.pathInput}
                  placeholder={i18n.t('Enter a hash: QmS4ustL54u...')} />
              </Col>
              <Col xs={2}>
                <Button bsStyle={'primary'} className={'go'}
                  onClick={this._update}>
                  {i18n.t('GO')}
                </Button>
              </Col>
            </Row>
          </Row>
          {error}
          {views}
        </Col>
      </Row>
    )
  }
}

Objects.displayName = 'Objects'

Objects.contextTypes = {
  router: PropTypes.object.isRequired
}

Objects.propTypes = {
  gateway: PropTypes.string,
  match: PropTypes.object,
  ipfs: PropTypes.object
}

export default withIpfs(Objects)
