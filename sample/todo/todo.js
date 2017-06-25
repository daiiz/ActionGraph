var initStore = new InitStore('InitStore');

var updateNotes = function () {
  var _ = {};
  _.currentNotes = new GetNotes('GetNotes', []);
  _.store = new Store('Store', [_.currentNotes]);
  _.saveButton = new Trigger({
    selector: '#btn-save',
    event: 'click'
  }, [_.store]);
  ag.scope('updater', Object.values(_));
  return _;
};

var addNewNote = function () {
  var _ = {};
  _.add = new GetNewNote('GetNewNote');
  _.store = new Store('Store', [_.add]);
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
var updater = updateNotes();
var restore = restoreNotes();

var decorator = new Decorate('Decorate', [
  restore.restore,
  adder.store
]);

var render = new RenderNotes('RenderNotes', [decorator]);
var dialog = new Dialog('ErrorDialog', [updater.store, adder.store, restore.restore]);

ag.run();
