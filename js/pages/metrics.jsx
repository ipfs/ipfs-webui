var React = require('react');
var $ = require('jquery');
var LineChart = require('react-d3').LineChart;


var Metrics = React.createClass({
  getInitialState: function () {
    var t = this;

    var zero =  { x: new Date(), y: 0 };
    var generalData = [
      {name:"Alloc", values: [zero]   }, // react-d3 somehow dislikes empty values
      // {name:"TotalAlloc", values: [zero] },
      {name:"Sys", values: [zero] },
    ];

    var accessData = [
      {name:"Lookups", values: [zero] },
      {name:"Mallocs", values: [zero] },
      {name:"Frees", values: [zero] },
    ]

    var heapData = [
      {name:"HeapAlloc", values: [zero]   }, // react-d3 somehow dislikes empty values
      // {name:"TotalAlloc", values: [zero] },
      {name:"HeapSys", values: [zero] },
      {name:"HeapIdle", values: [zero] },
      {name:"HeapInuse", values: [zero] },
    ];

    var stackData = [
      {name:"StackInuse", values: [ zero ]   }, // react-d3 somehow dislikes empty values
      {name:"StackSys", values: [zero] },

    {name:"StackInuse" , values:[zero]},
   {name:"StackSys"   , values:[zero]},
   {name:"MSpanInuse" , values:[zero]},
   {name:"MSpanSys"   , values:[zero]},
   {name:"MCacheInuse", values:[zero]},
   {name:"MCacheSys"  , values:[zero]},
   {name:"BuckHashSys", values:[zero]},
   {name:"GCSys"      , values:[zero]},
   {name:"OtherSys"   , values:[zero]},
    ];

    var getData = function() {
      var xhr = $.get("http://localhost:8010/debug/vars");
      xhr.done(function(resp) {
        // console.log("xhr succeeded");

        generalData.forEach(function(elem, idx) {
          elem.values.push({x:new Date(), y:resp.memstats[elem.name]});
        });

        accessData.forEach(function(elem, idx) {
          elem.values.push({x:new Date(), y:resp.memstats[elem.name]});
        });

        heapData.forEach(function(elem, idx) {
          elem.values.push({x:new Date(), y:resp.memstats[elem.name]});
        });

        stackData.forEach(function(elem, idx) {
          elem.values.push({x:new Date(), y:resp.memstats[elem.name]});
        });

        t.setState({
          generalData: generalData,
          accessData: accessData,
          heapData: heapData,
          stackData: stackData,
        });

      });
      xhr.fail(function(err) {
        console.error(arguments);
        t.error(err);
      });
    };

    getData();
    // setting the inverval to low results in:
    // Uncaught Error: Invariant Violation: setState(...): Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
    t.pollInterval = setInterval(getData, 5000);

    return {
      generalData: generalData,
      accessData: accessData,
      heapData: heapData,
      stackData: stackData,
    };
  },

  componentWillUnmount: function () {
    clearInterval(this.pollInterval);
  },


  render: function () {
    return (
      <div className="row">
        <div className="col-sm-10 col-sm-offset-1 webui-logs">
          <h2>Garbage collector statistics</h2>
          <p>See the <a target="_blank" href="https://godoc.org/pkg/runtime#MemStats">godocs</a> for more.</p>
          <LineChart
            data={this.state.generalData}
            legend={true} width={700} height={300}
            title="General Stats"
          />

          <LineChart
            data={this.state.accessData}
            legend={true} width={700} height={300}
            title="access Stats"
          />

          <LineChart
            data={this.state.heapData}
            legend={true} width={700} height={300}
            title="Heap Stats"
          />

          <LineChart
            data={this.state.stackData}
            legend={true} width={700} height={300}
            title="Stack Stats"
          />
        </div>
      </div>
  );
}
});



module.exports = Metrics;
