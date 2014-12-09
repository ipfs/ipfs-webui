var React = require('react')
var Nav = require('react-bootstrap/Nav')
var NavItem = require('react-bootstrap/NavItem')

module.exports = React.createClass({

  render: function() {
    return (
      <Nav bsStyle="tabs" activeKey={this.props.activeKey}  style={{"margin-bottom": "60px"}}>
        <NavItem key={1} href="/"><i className="fa fa-desktop"></i> Home</NavItem>
        <NavItem key={2} href="/connections"><i className="fa fa-share-alt"></i> Connections</NavItem>
        <NavItem key={3} href="/files"><i className="fa fa-copy"></i> Files</NavItem>
      </Nav>
    )
  }
})
