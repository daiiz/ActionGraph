var AF_OP_NAME = 'Op';
var AF_CONST_OP_NAME = 'ConstOp';

class ActionFlow {
  constructor () {
    this.__version__ = '0.0.1';
    this.__global__ = {};
  }

  global () {
    return this.__global__;
  }

  action () {

  }
}

class Op {
  constructor (name='Op', ops=[]) {
    this.name = name;
    this.argOps = ops;
    // 定義された内容を実行した結果が格納される
    this.action = null;
    this.__id__ = `Op_${Math.floor(Math.random() * 10000000000)}`;
  }

  identifier () {
    return (this.name === AF_OP_NAME || this.name === AF_CONST_OP_NAME) ? this.__id__ : this.name;
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
  async (op, callbackSuccessOp, callbackFailOp) {
    if (!op) return;
    console.info(op);
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
