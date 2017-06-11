// Create a new directed graph

var addOp = function (g, opName, level) {
  g.setNode(opName, {
    shape: 'ellipse',
    label: opName,
    style: `fill: #fff; stroke: #555; stroke-width: ${level}px;`
  });
  return g;
};

var addEdge = function (g, opFrom, opTo, level) {
  g.setEdge(opFrom, opTo, {
    label: "{...}",
    style: `stroke: #555; stroke-width: ${level}px; fill: none;`
  });
  return g;
};

var renderStaticGraph = function (af) {
  var g = new dagreD3.graphlib.Graph({compound:true}).setGraph({});

  var ag = af.global();
  var groupNames = Object.keys(ag);
  for (var i = 0; i < groupNames.length; i++) {
    var groupName = groupNames[i];

    g.setNode(groupName, {
      label: groupName,
      clusterLabelPos: 'top',
      style: 'fill: #fafafa; stroke: #555; stroke-width: 1.5px;'
    });

    var rootOps = ag[groupName];
    for (var j = 0; j < rootOps.length; j++) {
      var rootOp = rootOps[j];

      // add rootOp
      var rootOpId = rootOp.identifier();
      g = addOp(g, rootOpId, 2);
      //g.setParent(rootOpId, groupName);

      // add argOps
      var argOps = rootOp.refOps();
      for (var k = 0; k < argOps.length; k++) {
        var argOp = argOps[k];
        var argOpId = argOp.identifier();
        g = addOp(g, argOpId, 1);
        g = addEdge(g, argOpId, rootOpId, 1.5);
      }
    }
  }

  drawGraph(g);
};


var drawGraph = function (g) {
  g.nodes().forEach(function(v) {
    var node = g.node(v);
    node.rx = node.ry = 5;
  });

  var svg = d3.select("svg");
  var inner = svg.select("g");

  var zoom = d3.behavior.zoom().on("zoom", function() {
        inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                    "scale(" + d3.event.scale + ")");
      });
  svg.call(zoom);

  var render = new dagreD3.render();
  render(inner, g);

  // Center the graph
  var initialScale = 0.75;
  svg.attr('width', window.innerWidth);
  svg.attr('height', window.innerHeight);
  zoom
    .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
    .scale(initialScale)
    .event(svg);
};
