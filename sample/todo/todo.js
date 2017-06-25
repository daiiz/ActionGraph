var initStore = new InitStore('InitStore');

var removeNote = function () {
  var _ = {};
  _.remove = new EraseNote('EraseNote', []);
  _.removeButton = new Trigger({
    selector: '.rm',
    event: 'click'
  }, [_.remove]);
  ag.scope('remover', Object.values(_));
  return _;
};

var updateNotes = function (ops) {
  var _ = {};
  _.currentNotes = new GetNotes('GetNotes', []);
  ops.push(_.currentNotes);
  _.store = new StoreAll('StoreAll', ops);
  ag.scope('updater', Object.values(_));
  return _;
};

var addNewNote = function () {
  var _ = {};
  //_.add = new GetNewNote('GetNewNote');
  _.store = new Store('Store', []);
  _.addButton = new Trigger({
    selector: '#btn-add',
    event: 'click'
  }, [_.store]);
  ag.scope('adder', Object.values(_));
  return _;
};

var restoreNotes = function () {
  var _ = {};
  _.loadend = new Trigger({
    selector: 'body',
    event: 'load'
  }, [initStore]);
  _.restore = new Restore('Restore', [initStore]);
  ag.scope('loader', Object.values(_));
  return _;
};

var adder = addNewNote();
var remover = removeNote();
var updater = updateNotes([remover.remove]);
var restore = restoreNotes();

var decorator = new Decorate('Decorate', [
  restore.restore,
  adder.store
]);

var render = new RenderNotes('RenderNotes', [decorator]);
var dialog = new Dialog('ErrorDialog', [updater.store, adder.store, restore.restore]);

ag.run();
