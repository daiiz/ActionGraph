// Create a new directed graph
var THEME_COLOR = '#FFC107';

var addOp = function (g, opName, level, opType) {
  var fill = '#fff';
  var stroke = '#9E9E9E';
  var shape = 'ellipse';
  var r = '';
  if (opType === 'const') {
    fill = '#CFD8DC';
    stroke = '#78909C';
  }
  if (opType === 'trigger') {
    shape = 'circle';
    fill = THEME_COLOR;
    r = 'r: 9;';
  }
  g.setNode(opName, {
    shape: shape,
    label: opName,
    style: `fill: ${fill}; stroke: ${stroke}; stroke-width: ${level}px; data-label: ${opName}; ${r}`
  });
  return g;
};

var addEdge = function (g, opFrom, opTo, level, stroke='#9E9E9E') {
  var lev = level;
  var actions = opTo.refOpActions(true);
  var opFromId = opFrom.identifier();
  var action = actions[opFromId];
  var actionKeys = [];
  if (action) {
    actionKeys = Object.keys(action);
  }

  if (actionKeys.length === 0) {
    level = 1;
    actionKeys = '';
  }else {
    level = 1 + (actionKeys.length / 2);
    actionKeys = `${actionKeys.join(', ')}`;
  }
  if (lev) level = lev;

  // 特殊Op
  if (opFrom.type === 'trigger') {
    actionKeys = opFrom.getAction()['event'] || '';
  }

  g.setEdge(opFromId, opTo.identifier(), {
    label: actionKeys,
    style: `stroke: ${stroke}; stroke-width: ${level}px; fill: none;`,
    arrowheadStyle: `fill: ${stroke}; stroke: ${stroke};`,
    lineInterpolate: 'basis'
  });
  return g;
};

var initGraphBoard = function () {
  var $panel = $('#actionflow_panel');
  $panel.resizable({
    handles: 'e'
  });
};

var renderStaticGraph = function () {
  var g = new dagreD3.graphlib.Graph({compound:true}).setGraph({});

  // グループを描画
  var groups = AF_OP_GROUPS;
  for (var i = 0; i < groups.length; i++) {
    var groupName = groups[i];
    g.setNode(groupName, {
      label: groupName,
      clusterLabelPos: 'top',
      style: `fill: #fafafa; stroke: #9E9E9E; stroke-width: 4px; rx:5; ry:5; opacity: 0.93;`
    });
  }

  // Opを描画
  var opNames = Object.keys(AF_OP_GRAPH);
  for (var i = 0; i < opNames.length; i++) {
    var opInfo = AF_OP_GRAPH[opNames[i]];
    var op = opInfo.op;
    var opGroupName = opInfo.group;
    if (op === null) {
      if (opGroupName) {
        var childGroupName = opNames[i];
        g.setParent(childGroupName, opGroupName);
      }
      continue;
    }
    var opId = op.identifier();
    var refOps = opInfo.refOps;

    if (opGroupName) {
      g = addOp(g, opId, 2, op.type);
      g.setParent(opId, opGroupName);
    }else {
      g = addOp(g, opId, 1, op.type);
    }

    // 参照されているOpsを見てエッジを追加
    if (refOps) {
      for (var j = 0; j < refOps.length; j++) {
        var refOp = refOps[j];
        g = addEdge(g, refOp, op, 1.5);
      }
    }

    // 特殊Op (Trigger)
    // 参照先のOpsを見てエッジを追加
    if (op.__opsTo__) {
      var opsTo = op.__opsTo__;
      for (var j = 0; j < opsTo.length; j++) {
        var opTo = opsTo[j];
        g = addEdge(g, op, opTo, 2.5, THEME_COLOR);
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

$('#btn-reload').on('click', function () {
  renderStaticGraph();
});

$(function () {
  initGraphBoard();
});
