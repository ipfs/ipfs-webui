import React, {Component} from 'react'
import FileList from '../views/filelist'
import i18n from '../utils/i18n.js'
import {Row, Col, Panel} from 'react-bootstrap'

export
default class Bitswap extends Component {
  state = {
    wantlist: []
  };

  static displayName = 'Bitswap';
  static propTypes = {
    pollInterval: React.PropTypes.func,
    ipfs: React.PropTypes.object
  };

  componentDidMount () {
    this.props.pollInterval = setInterval(() => this.update(), 1000)
    this.update()
  }

  update () {
    this.props.ipfs.send('bitswap/wantlist', null, null, null, (err, wantlist) => {
      if (err) return console.error(err)
      this.setState({
        wantlist
      })
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
