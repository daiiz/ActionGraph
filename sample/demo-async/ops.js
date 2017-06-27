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
      type: dict.method,
      dataType: 'json',
      data: dict.data
    }).success(data => {
      var c = new Const({data: data}, 'fetchedData');
      if (successOp) {
        var op = new successOp('success', [c], self);
        op.run(this);
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

class MyLog extends Op {
  constructor (name, ops, referrerOp) {super(name, ops, referrerOp);}

  def (caller) {
    var fetchedData = this.argOps[0];
    var data = fetchedData.getAction('data');
    var $msg = this.$('#message');
    $msg.append(`<div>${data.name}</div>`);
    console.info(fetchedData);
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

    var $elem = ag.$('#result', this);
    var c = new Const({
      url: '/sample/sample.json',
      method: 'GET',
      data: {count: t}
    }, 'requestAPI');

    this.addScope(c);
    this.storeAction({'num': t});

    // 非同期処理の書き方
    this.async(new jQueryAjax('MyAjaxOp', [c], this), MyLog, Log);
  }
}
