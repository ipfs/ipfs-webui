import React from 'react'
import FileList from '../views/filelist'
import i18n from '../utils/i18n.js'
import {Row, Col, Panel} from 'react-bootstrap'

export default React.createClass({
  displayName: 'Bitswap',
  propTypes: {
    pollInterval: React.PropTypes.func
  },
  getInitialState: function () {
    var t = this

    var update = function () {
      t.props.ipfs.send('bitswap/wantlist', null, null, null, function (err, res) {
        if (err) return console.error(err)
        t.setState({ wantlist: res })
      })
    }

    update()
    t.props.pollInterval = setInterval(update, 1000)

    return {
      wantlist: []
    }
  },

  componentWillUnmount: function () {
    clearInterval(this.props.pollInterval)
  },

  render: function () {
    var wantlist = this.state.wantlist

    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <h3>{i18n.t('Bitswap')}</h3>
          <br/>

          <div>
            <h4>
              <strong>{i18n.t('Wantlist')}</strong>&nbsp;
              <small>({i18n.t('X file', { postProcess: 'sprintf', sprintf: [wantlist.length], count: wantlist.length })})</small>
            </h4>
            <Panel bsStyle={'default'}>
              <FileList className='panel-inner' files={wantlist} namesHidden />
            </Panel>
          </div>
          <br/>
        </Col>
      </Row>
    )
  }
})
