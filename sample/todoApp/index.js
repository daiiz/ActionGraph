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

var printOp = new PrintOp('SubPrintOp');
ag.print = new PrintOp('MyPrintOp', [printOp, printOp]);

console.info(af, ag);
console.log(ag.print);

//ag.print.run();
console.info('!', ag.print.getAction());
