var const1 = new Const({'num': 1});
var const2 = new Const({'num': 2});

var main1 = new PrintOp('MainPrintOp', [const1, const2]);
var main2 = new PrintOp('MainPrintOp', [main1]);

var button1 = new Trigger({selector: '#button1', event: 'click'}, [main1]);
ag.scope('print', [main1, main2]);
