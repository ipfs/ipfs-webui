import React, {Component} from 'react'
import PropTypes from 'prop-types'
import FileList from '../components/filelist'
import i18n from '../utils/i18n.js'
import {Row, Col, Panel} from 'react-bootstrap'
import {withIpfs} from '../components/ipfs'

class Bitswap extends Component {
  constructor (props) {
    super(props)
    this.state = {
      wantlist: []
    }
  }

  componentDidMount () {
    this.props.pollInterval = setInterval(() => this.update(), 1000)
    this.update()
  }

  update () {
    // TODO pretty sure we should be using the API and not an internal here..
    this.props.ipfs.send('bitswap/wantlist', null, null, null, (err, wantlist) => {
      if (err) {
        return console.error(err)
      }
      this.setState({ wantlist: wantlist })
    })
  }

  componentWillUnmount () {
    clearInterval(this.props.pollInterval)
  }

  render () {
    const wantlist = this.state.wantlist

    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <h3>{i18n.t('Bitswap')}</h3>
          <br />
          <div>
            <h4>
              <strong>{i18n.t('Wantlist')}</strong>&nbsp;
              <small>({i18n.t('X file', { postProcess: 'sprintf', sprintf: [wantlist.length], count: wantlist.length })})</small>
            </h4>
            <Panel bsStyle={'default'}>
              <FileList className='panel-inner' files={wantlist} namesHidden />
            </Panel>
          </div>
          <br />
        </Col>
      </Row>
    )
  }
}

Bitswap.displayName = 'Bitswap'
Bitswap.propTypes = {
  pollInterval: PropTypes.func,
  ipfs: PropTypes.object
}

export default withIpfs(Bitswap)
