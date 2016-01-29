import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import Peer from '../views/peer'
import {loadHomePage} from '../actions'

const Welcome = () => {
  return (
    <Row className='welcome'>
      <h3>Welcome to IPFS</h3>
      <p>
        This is your central control point for IPFS on your machine.
        If you want to learn more you can visit our
        {' '}
        <a href='https://ipfs.io'>website</a>, IRC channel <code>#ipfs</code>
        on freenode or our
        {' '}
        <a href='https://github.com/ipfs'>GitHub organization</a>.
      </p>
    </Row>
  )
}

class Home extends Component {
  static propTypes = {
    loadHomePage: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired
  };

  componentWillMount () {
    this.props.loadHomePage()
  }

  render () {
    return (
      <div>
        <div className='welcome-header'>
          IPFS Dashboard
        </div>
        <div className='welcome-img'></div>
        <Row>
          <Col sm={10} smOffset={1}>
            <Welcome />
            <Peer peer={this.props.node} location={{}}/>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps (state) {
  const {id} = state

  return {
    node: id
  }
}

export default connect(mapStateToProps, {
  loadHomePage
})(Home)
