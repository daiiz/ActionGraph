var todoApp = {
  STORE_KEY: 'todo_app',
  APP_NAME: 'todoApp',
  VERSION: '0.0.2'
};

class Store extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('ローカルに保存');
  }

  def () {
    var refOps = this.refOps();
  }
}

class Restore extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('メモを読み出す');
  }

  def (caller) {
    var notes = caller.getAction('store').notes;
    console.info(notes);
    if (notes.length === 0) {
      this.storeAction({'message': 'まだメモがありません。'});
      //this.nextOp('ErrorDialog').run(this);
    }

  }
}

class InitStore extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('ストレージを初期化');
  }

  def () {
    var store = localStorage[todoApp.STORE_KEY];
    var status = {};
    if (!store || JSON.parse(store).version !== todoApp.VERSION) {
      var store = {
        version: todoApp.VERSION,
        app_name: todoApp.APP_NAME,
        user_name: '',
        notes: []
      };
      localStorage[todoApp.STORE_KEY] = JSON.stringify(store);
      status.init = true;
    }
    store = JSON.parse(localStorage[todoApp.STORE_KEY]);
    status.version = store.version;
    status.store = store;

    this.storeAction(status);
    this.nextOp('Restore').run(this);
  }
}

class RenderNotes extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('メモを表示');
  }

  def () {
    var refOps = this.refOps();
  }
}

class Dialog extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('ダイアログウィンドウを表示');
  }

  def (caller) {
    var msg = caller.getAction('message') || '!!';
    alert(msg);
  }
}

class Decorate extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('記法をHTMLに変換');
  }

  def () {
    var refOps = this.refOps();
  }
}

class GetNotes extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('表示中のメモを取得');
  }

  def () {
    var refOps = this.refOps();
  }
}

class GetNewNote extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('新たなメモを取得');
  }

  def () {
    var refOps = this.refOps();
  }
}
