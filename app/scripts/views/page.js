import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import Nav from './nav'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const ipfs = require('ipfs-api')(host, port)

export default class Page extends React.Component {
  state = {
    version: '',
    updating: false,
    gateway: 'http://127.0.0.1:8080'
  };

  static displayName = 'Page';
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  static propTypes = {
    children: React.PropTypes.object
  };

  componentDidMount () {
    ipfs.version((err, res) => {
      if (err) return console.error(err)
      this.setState({
        version: res.Version
      })
    })
    ipfs.config.get('Addresses.Gateway', (err, res) => {
      if (err || !res) return console.error(err)
      const split = res.Value.split('/')
      const port = split[4]
      this.setState({
        gateway: 'http://' + window.location.hostname + ':' + port
      })
    })
  }

  update () {
    ipfs.update.apply((err, res) => {
      this.setState({
        updating: false
      })
      if (!err) window.location = window.location.toString()
    })
    this.setState({
      updating: true
    })
  }

  render () {
    let children = ''
    if (this.props.children) {
      children = React.cloneElement(
        this.props.children, {
          ipfs: ipfs,
          host: host,
          gateway: this.state.gateway
        }
      )
    }

    return (
      <Grid fluid>
        <Row>
          <div className='navbar-collapse collapse in' id='bs4'>
            <Col sm={2} className='sidebar'>
              <Nav/>
            </Col>
          </div>
          <Col sm={10} smPush={2} className='main'>
            {children}
          </Col>
        </Row>
      </Grid>
    )
  }
}
