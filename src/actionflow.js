var AF_OP_NAME = 'Op';
var AF_CONST_OP_NAME = 'ConstOp';
var AF_MODE_ANALYSIS = false;
var AF_ROOT = '#actionflow_root';

var AF_OP_NAME_TABLE = {};
var AF_GROUP_NAME_TABLE = {};

var AF_OP_GRAPH = {};
var AF_OP_GROUPS = [];
var AF_DOM_TABLE = {};

var afOrignalName = function (name, table) {
  if (table[name] === undefined) {
    table[name] = 0;
  }else {
    table[name] += 1;
    name += '_' + table[name];
  }
  return name;
};

class ActionFlow {
  constructor () {
    this.__version__ = '0.0.1';
    this.__global__ = {};
    this.bindEvents();
  }

  report (opNodeLabel) {
    var $reportBoxOp = $('#box-operation');
    var $reportBoxAction = $('#box-action');
    var $reportBoxDom = $('#box-dom');

    var selectors = AF_DOM_TABLE[opNodeLabel] || [];
    $reportBoxOp.text(opNodeLabel);

    
    for (var i = 0; i < selectors.length; i++) {
      var $elem = $(selectors[i]);
      console.info($elem);
    }

  }

  bindEvents () {
    var detectNodeLabel = function ($e) {
      var styleProps = $e.attr('style').split(';');
      var label = null;
      for (var i = 0; i < styleProps.length; i++) {
        var prop = styleProps[i].split(':');
        if (prop[0].trim() === 'data-label') {
          label = prop[1].trim();
        }
      }
      return label
    };

    $(AF_ROOT).on('click', 'ellipse', e => {
      var $e = $(e.target).closest('ellipse');
      this.report(detectNodeLabel($e));
    });

    $(AF_ROOT).on('click', 'circle', e => {
      var $e = $(e.target).closest('circle');
      this.report(detectNodeLabel($e));
    });
  }

  global () {
    return this.__global__;
  }

  group (groupName, ops) {
    groupName = afOrignalName(groupName, AF_GROUP_NAME_TABLE);
    var globalGroup = this.global();
    if (!globalGroup[groupName]) globalGroup[groupName] = [];
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      var opId = op.identifier();
      AF_OP_GRAPH[opId].group = groupName;
      globalGroup[groupName].push(op);
    }
    AF_OP_GROUPS.push(groupName);
  }

  $ (selector, binderOp) {
    // 未登録ならば登録
    var binderName = binderOp.name;
    if (!AF_DOM_TABLE[binderName]) AF_DOM_TABLE[binderName] = [];
    if (AF_DOM_TABLE[binderName].indexOf(selector) === -1) {
      AF_DOM_TABLE[binderName].push(selector);
    }
    return $(selector);
  }

  scope (groupName, ops) {
    this.group(groupName, ops);
  }
}

class Op {
  constructor (name='Op', ops=[], referrerOp=null) {
    this.name = afOrignalName(name, AF_OP_NAME_TABLE);
    this.referrerOp = referrerOp;
    this.argOps = ops;
    // 定義された内容を実行した結果が格納される
    this.action = null;
    this.type = 'op';
    this.__id__ = `Op_${Math.floor(Math.random() * 10000000000)}`;
    this.scope = [];

    AF_OP_GRAPH[this.name] = {
      op: this,
      refOps: this.argOps
    };

    if (referrerOp) {
      this.argOps.push(referrerOp);
      AF_OP_GRAPH[this.name].group = referrerOp.group();
    }
  }

  identifier () {
    return this.name;
  }

  run (recursive=false) {
    this.def();
  }

  def (successOp, failOp, constOp) {}

  refOps () {
    return this.argOps;
  }

  refOpActions (skipNull) {
    var actions = {};
    var refOps = this.refOps();
    for (var i = 0; i < refOps.length; i++) {
      var op = refOps[i];
      var a = op.getAction();
      var name = op.identifier();
      if (skipNull) {
        if (a !== null) actions[name] = a;
      }else {
        actions[name] = a;
      }
    }
    return actions;
  }

  group () {
    var opId = this.identifier();
    var group = AF_OP_GRAPH[opId].group;
    return group;
  }

  storeAction (action={}) {
    this.action = new Action(action);
  }

  getAction () {
    if (this.action) return this.action.__a__;
    return this.action;
  }

  addScope (op) {
    var opId = op.identifier();
    AF_OP_GRAPH[opId].group = AF_OP_GRAPH[this.identifier()].group;
  }

  // callbackSuccessOp, callbackFailOp: Opの定義
  async (op, callbackSuccessOp, callbackFailOp, callbackName='Async') {
    var groupName = afOrignalName(callbackName, AF_GROUP_NAME_TABLE);
    var opId = op.identifier();
    if (!AF_OP_GRAPH[opId]) {
      AF_OP_GRAPH[opId].group = groupName;
      AF_OP_GROUPS.push(groupName);
    }else {
      // グループの所属の更新
      var oldGroupName = AF_OP_GRAPH[opId].group;
      AF_OP_GRAPH[opId].group = groupName;
      AF_OP_GRAPH[groupName] = {
        group: oldGroupName,
        op: null
      };
      AF_OP_GROUPS.push(groupName);
    }
    if (AF_MODE_ANALYSIS) {

      return;
    }
    if (!op) return;
    op.def(callbackSuccessOp, callbackFailOp, op.refOps()[0]);
  }

  /* 解析用 */
  analysis () {
    this.def();
  }
}

class Action {
  constructor (val={}) {
    this.__a__ = val;
  }
}

// builtin-op
class Const extends Op {
  constructor (dict, name, referrerOp) {
    if (!name) name = afOrignalName('ConstOp', AF_OP_NAME_TABLE);
    super(name, [], referrerOp);
    this.type = 'const';
    this.def(dict);
  }

  def (constDict) {
    this.storeAction(constDict);
  }
}

class Log extends Op {
  constructor (name, ops, referrerOp) {
    if (!name) name = afOrignalName('LoggerOp', AF_OP_NAME_TABLE);
    super(name, ops, referrerOp);
  }

  def () {
    console.dir(this.refOpActions());
  }
}

// ops: 接続先のOp
class Trigger extends Op {
  constructor (dict, ops=[]) {
    name = dict.selector || 'Trigger';
    name = afOrignalName(name, AF_OP_NAME_TABLE);
    super(name, [], null);

    this.__opsTo__ = ops;
    this.type = 'trigger';
    this.def(dict);
  }

  def (triggerDict) {
    this.storeAction(triggerDict);
    var selector = triggerDict.selector;
    var $elem = af.$(selector, this);
  }
}
