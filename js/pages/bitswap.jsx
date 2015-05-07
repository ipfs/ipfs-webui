var React = require('react')
var FileList = require('../views/filelist.jsx')

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
          <h3>Bitswap</h3>
          <br/>

          <div>
            <h4>
              <strong>Wantlist</strong>&nbsp;
              <small>({wantlist.length} file{wantlist.length !== 1 ? 's' : ''})</small>
            </h4>
            <div className='panel panel-default'>
              <FileList className='panel-inner' files={wantlist} namesHidden={true}/>
            </div>
          </div>
          <br/>
        </div>
      </div>
    )
  }
})
