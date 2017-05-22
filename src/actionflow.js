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
  constructor () {
    this.def();
  }

  run () {}

  def (ops=[]) {
    console.log(ops.length);
  }
}

class Action {
  constructor (val) {
    this.value = val;
  }
}
