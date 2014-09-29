var React = require('react')
var Nav = require('../views/nav.jsx')
var NodeProps = require('../views/nodeprops.jsx')
var TabbedArea = require('react-bootstrap/TabbedArea')
var TabPane = require('react-bootstrap/TabPane')

module.exports = React.createClass({
  render: function() {
    return (
  <div className="row">
    <div className="col-sm-8 col-sm-offset-2">

      <Nav activeKey={1} />

      <h3>Node Info</h3>
      <div className="panel panel-default">
        {NodeProps({
          node: {
            id: "QmT8uptFpXSmk63VtU8VPy4AGHEbAA7rQWFYJKDggSd2xN",
            address: "/ip4/10.20.30.40/tcp/4001",
          }
        })}
      </div>

    </div>
  </div>
    )
  }
})
