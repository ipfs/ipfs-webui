var React = require('react')
var Nav = require('../views/nav.jsx')
var PeerList = require('../views/peerlist.jsx')
var SwarmVis = require('../views/swarmvis.jsx')

module.exports = React.createClass({
  render: function() {
    return (
  <div className="row">
    <div className="col-sm-8 col-sm-offset-2">

      <Nav activeKey={2} />

      <SwarmVis />

      <div className="panel panel-default">
        {PeerList({
          peers: [
            {id: "Qaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
             address: "/ip4/100.200.100.200/tcp/5678" },
            {id: "Qbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
             address: "/ip4/100.200.100.200/tcp/5679" },
            {id: "Qaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
             address: "/ip4/100.200.100.200/tcp/5678" },
            {id: "Qbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
             address: "/ip4/100.200.100.200/tcp/5679" },
            {id: "Qaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
             address: "/ip4/100.200.100.200/tcp/5678" },
            {id: "Qbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
             address: "/ip4/100.200.100.200/tcp/5679" },
          ]
        })}
      </div>

    </div>
  </div>
    )
  }
})
