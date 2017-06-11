var AF_OP_NAME = 'Op';
var AF_CONST_OP_NAME = 'ConstOp';
var AF_MODE_ANALYSIS = false;

var AF_OP_NAME_TABLE = {};
var AF_GROUP_NAME_TABLE = {};

var AF_OP_GRAPH = {};

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
  }

  action () {

  }
}

class Op {
  constructor (name='Op', ops=[]) {
    this.name = afOrignalName(name, AF_OP_NAME_TABLE);
    this.argOps = ops;
    // 定義された内容を実行した結果が格納される
    this.action = null;
    this.__id__ = `Op_${Math.floor(Math.random() * 10000000000)}`;
    AF_OP_GRAPH[this.name] = {};
  }

  identifier () {
    return this.name;
  }

  run (recursive=false) {
    this.def();
  }

  def (successOp, failOp) {}

  refOps () {
    return this.argOps;
  }

  refOpActions () {
    var actions = {};
    var refOps = this.refOps();
    for (var i = 0; i < refOps.length; i++) {
      var op = refOps[i];
      var a = op.getAction();
      var name = op.identifier();
      actions[name] = a;
    }
    return actions;
  }

  storeAction (action={}) {
    this.action = new Action(action);
  }

  getAction () {
    if (this.action) return this.action.__a__;
    return this.action;
  }

  // func: 処理内容
  // op: 処理完了後の遷移先Op
  async (op, callbackSuccessOp, callbackFailOp, callbackName='Async') {
    AF_OP_GRAPH[op.identifier()].group = afOrignalName(callbackName, AF_GROUP_NAME_TABLE);
    if (AF_MODE_ANALYSIS) {
      //console.info(op, callbackSuccessOp, callbackFailOp)
      return;
    }
    if (!op) return;
    op.def(callbackSuccessOp, callbackFailOp);
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
  constructor (dict, name) {
    if (!name) name = 'ConstOp';
    super(name, []);
    this.def(dict);
  }

  def (constDict) {
    this.storeAction(constDict);
  }
}

class Log extends Op {
  constructor (name, ops) {
    if (!name) name = 'LoggerOp';
    super(name, ops);
  }

  def () {
    console.dir(this.refOpActions());
  }
}
