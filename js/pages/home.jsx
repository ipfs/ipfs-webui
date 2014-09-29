var React = require('react')
var NodeProps = require('../views/nodeprops.jsx')
var TabbedArea = require('react-bootstrap/TabbedArea')
var TabPane = require('react-bootstrap/TabPane')

module.exports = (
  <div className="row">
    <div className="col-sm-8 col-sm-offset-2">

      <TabbedArea bsStyle="pills" defaultActiveKey={1} animation={false}>
        <TabPane key={1} tab="Node Info">

        <div className="panel panel-default">
          {NodeProps({
            node: {
              id: "QmT8uptFpXSmk63VtU8VPy4AGHEbAA7rQWFYJKDggSd2xN",
              address: "/ip4/10.20.30.40/tcp/4001",
            }
          })}
        </div>

        </TabPane>
      </TabbedArea>

    </div>
  </div>
)
