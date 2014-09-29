var React = require('react')
var Page = require('../views/page.jsx')
var NodeProps = require('../views/nodeprops.jsx')
var TabbedArea = require('react-bootstrap/TabbedArea')
var TabPane = require('react-bootstrap/TabPane')

module.exports = (
  <Page>

    <div className="row">
      <div className="col-sm-6">
        <TabbedArea bsStyle="pills" defaultActiveKey={1} animation={false}>
          <TabPane key={1} tab="Node Info">

          <div className="panel panel-default">
            {NodeProps({
              node: {
                id: "QmT8uptFpXSmk63VtU8VPy4AGHEbAA7rQWFYJKDggSd2xN",
                address: "/ip4/10.20.30.40/tcp/4001",
            }})}
          </div>

          </TabPane>
        </TabbedArea>
      </div>
    </div>
  </Page>
)
