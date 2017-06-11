var af = new ActionFlow();
var ag = af.global();


class jQueryAjax extends Op {
  constructor (name, ops) {super(name, ops);}

  def (successOp=null, failOp=null) {
    var constOp = this.refOps()[0];
    var dict = constOp.getAction();
    $.ajax({
      url: dict.url,
      type: 'POST',
      dataType: 'json',
      data: dict.data
    }).success(data => {
      var c = new Const({data: data});
      if (successOp) {
        var op = new successOp(null, [c]);
        op.run();
      }
    }).fail(data => {
      var c = new Const({data: data});
      if (failOp) {
        var op = new failOp(null, [c]);
        op.run();
      }
    });
  }
}

class PrintOp extends Op {
  constructor (name, ops) {super(name, ops);}

  def () {

    // 参照元のOpのActionを見る
    var t = 0;
    var refOps = this.refOps();
    for (var i = 0; i < refOps.length; i++) {
      var a = refOps[i].getAction();
      if (a) t += a.num;
      console.log('>>', a);
    }

    t += 1;

    // 非同期処理の書き方
    this.async(
      new jQueryAjax('MyAjaxOp', [
        new Const({
          url: 'http://daiiz-apps.appspot.com/sb/p/a',
          method: 'POST',
          data: {'a': 'A'}
        })
      ]), Log, Log);
    this.storeAction({'num': t});
  }
}

var printOp1 = new PrintOp('SubPrintOp');
var printOp2 = new PrintOp('SubPrintOp');

var main1 = new PrintOp('MainPrintOp', [printOp1, printOp2]);
var main2 = new PrintOp('MainPrintOp', [main1]);

af.group('print', [main1, main2]);


AF_MODE_ANALYSIS = true;
ag.print[0].run();
console.info('!', ag.print[0].getAction());

console.log(AF_OP_GRAPH, AF_GROUP_NAME_TABLE, AF_OP_NAME_TABLE);
renderStaticGraph(af);
