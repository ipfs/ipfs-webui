var React = require('react')
var FileList = require('../views/filelist')
var i18n = require('../utils/i18n.js')

module.exports = React.createClass({
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
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1'>
          <h3>{i18n.t('Bitswap')}</h3>
          <br/>

          <div>
            <h4>
              <strong>{i18n.t('Wantlist')}</strong>&nbsp;
              <small>({i18n.t('X file', { postProcess: 'sprintf', sprintf: [wantlist.length], count: wantlist.length })})</small>
            </h4>
            <div className='panel panel-default'>
              <FileList className='panel-inner' files={wantlist} namesHidden />
            </div>
          </div>
          <br/>
        </div>
      </div>
    )
  }
})
