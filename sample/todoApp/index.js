var af = new ActionFlow();
var ag = af.global();

class PrintOp extends Op {
  constructor () {
    super();
    console.info(888);
  }

  def (ops) {
  }
}

af.init = {
};

ag.print = new PrintOp();

console.info(af);
console.log(ag.print);
