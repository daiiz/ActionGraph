class jQueryAjax extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('AjaxOp');
  }

  def (successOp=null, failOp=null, constOp=null) {
    var self = this;
    var dict = constOp.getAction();
    $.ajax({
      url: dict.url,
      type: 'POST',
      dataType: 'json',
      data: dict.data
    }).success(data => {
      var c = new Const({data: data}, 'fetchedData');
      if (successOp) {
        var op = new successOp('success', [c], self);
        op.run();
      }
    }).fail(data => {
      var c = new Const({data: data}, 'fetchedData');
      if (failOp) {
        var op = new failOp('failed', [c], self);
        op.run();
      }
    });
  }
}

class PrintOp extends Op {
  constructor (name, ops, referrerOp) {super(name, ops, referrerOp);}

  def () {
    // 参照元のOpのActionを見る
    var t = 0;
    var refOps = this.refOps();
    console.log('>>', t);
    for (var i = 0; i < refOps.length; i++) {
      var a = refOps[i].getAction();
      if (a) t += a.num;
    }
    t += 1;

    var $elem = ag.$('#result', this);
    var c = new Const({
      url: 'http://daiiz-apps.appspot.com/sb/p/a',
      method: 'POST',
      data: {'a': 'A'}
    }, 'requestAPI');

    this.addScope(c);

    // 非同期処理の書き方
    this.async(new jQueryAjax('MyAjaxOp', [c], this), Log, Log);
    this.storeAction({'num': t});
  }
}
