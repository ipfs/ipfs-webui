var React = require('react')
var Nav = require('../views/nav.jsx')
var FileList = require('../views/filelist.jsx')

module.exports = React.createClass({
  render: function() {
    //  TODO: add file view to show content of selected file
    
    return (
  <div className="row">
    <div className="col-sm-8 col-sm-offset-2">

      <Nav activeKey={3} />

      <div className="panel panel-default">
        {FileList({
          files: [
            {name: 'test.txt', id: "Qaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},
            {name: 'helloworld.go', id: "Qbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}
          ]
        })}
      </div>

    </div>
  </div>
    )
  }
})
