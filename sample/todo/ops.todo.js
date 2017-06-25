var todoApp = {
  STORE_KEY: 'todo_app',
  APP_NAME: 'todoApp',
  VERSION: '0.0.2'
};


class StoreAll extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('表示中のすべてをローカルに保存');
  }

  def (caller) {
    var $textbox = this.$('#textbox');
    var note = $textbox.val();
    $textbox.val('');
    var store = JSON.parse(localStorage[todoApp.STORE_KEY]);

    // 既存のメモリストを更新
    var notesOp = this.prevOp('GetNotes');
    var notes = notesOp.getAction('notes');
    if (!notes) {
      // 無限再帰に注意
      notesOp.run(this);
      return;
    }
    store.notes = notes.reverse();
    localStorage[todoApp.STORE_KEY] = JSON.stringify(store);
    this.storeAction({notes: [note]});
  }
}

class Store extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('ローカルに保存');
  }

  def (caller) {
    var $textbox = this.$('#textbox');
    var note = $textbox.val();
    $textbox.val('');
    var store = JSON.parse(localStorage[todoApp.STORE_KEY]);

    if (note.length > 0) {
      // 新規メモ保存
      store.notes.push(note);
      localStorage[todoApp.STORE_KEY] = JSON.stringify(store);
      this.storeAction({notes: [note]});
      this.nextOp('Decorate').run(this);
    }
  }
}

class Restore extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('メモを読み出す');
  }

  def (caller) {
    var notes = caller.getAction('store').notes;
    if (notes.length === 0) {
      this.storeAction({'message': 'まだメモがありません。'});
      this.nextOp('ErrorDialog').run(this);
      return;
    }
    this.storeAction({
      notes: notes
    });
    this.nextOp('Decorate').run(this);
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

// 最新10件を表示する
class RenderNotes extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('メモを表示');
  }

  def (caller) {
    var notes = caller.getAction('notes').reverse();
    var $stage = $('#area-cards');
    var l = Math.min(notes.length, 10);
    for (var i = 0; i < l; i++) {
      var note = notes[i];
      var $card = $(`
        <div class="card">
          <span class="note">${note}</span>
          <i class="material-icons rm">clear</i>
        </div>`);
      if (l === 1) {
        $stage.prepend($card);
      }else {
        $stage.append($card);
      }
    }
  }
}

class EraseNote extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('選択したメモを消す');
  }

  def (caller) {
    var $card = $(this.triggerParams.target).closest('.card');
    $card.remove();
    this.nextOp('StoreAll').run(this);
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

  def (caller) {
    var notes = caller.getAction('notes');
    var res = [];
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      var spans = '';
      for (var j = 0; j < note.codepoints; j++) {
        spans += `<span>${note.uCharAt(j)}</span>`;
      }
      res.push(spans);
    }
    this.storeAction({
      notes: res
    });
    this.nextOp('RenderNotes').run(this);
  }
}

class GetNotes extends Op {
  constructor (name, ops, referrerOp) {
    super(name, ops, referrerOp);
    this.desc('表示中のメモを取得');
  }

  def (caller) {
    var res = [];
    var cards = $('.card');
    for (var i = 0; i < cards.length; i++) {
      var text = $(cards[i]).find('.note').text();
      res.push(text);
    }
    this.storeAction({notes: res});
    this.nextOp('StoreAll').run(this);
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
