// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    // 最上位のノードをスキップ
    for (let i = 0; i < bookmarkTreeNodes.length; i++) {
      const children = bookmarkTreeNodes[i].children;
      if (children && children.length > 0) {
        for (let j = 0; j < children.length; j++) {
          document.getElementById('bookmarks').appendChild(dumpTreeNodes(children[j].children));
        }
      }
    }
  });
}

function dumpTreeNodes(bookmarkNodes) {
  const list = document.createElement('ul');
  list.className = 'bookmark-list'; // クラス名を追加
  
  
  for (let i = 0; i < bookmarkNodes.length; i++) {
    list.appendChild(dumpNode(bookmarkNodes[i]));
  }

  return list;
}

function dumpNode(bookmarkNode) {
  const anchor = document.createElement('a');
  anchor.className = 'bookmark-link'; // クラス名を追加
  anchor.textContent = bookmarkNode.title;

  // クリックイベントを追加
  anchor.addEventListener('click', function (event) {
    console.log('click event');
    event.preventDefault();  // デフォルトのリンクの挙動を防止
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
      // 子ノードがある場合はそれを表示
      const ul = this.parentElement.querySelector('ul'); // クリックされたアンカーの親要素の <ul> を取得
      if (ul) {
        ul.style.display = ul.style.display === 'none' ? '' : 'none'; // 表示状態を切り替える
      }
    } else if (bookmarkNode.url) {
      // 子ノードがなく、URLがある場合は新しいタブでリンクを開く
      chrome.tabs.create({ url: bookmarkNode.url });
    }
  });

  const li = document.createElement('li');
  li.className = 'bookmark-item'; // クラス名を追加
  li.appendChild(anchor);
  if (bookmarkNode.url) {
    // 編集ボタンを追加

    const button = document.createElement('button');
    button.addEventListener('click', () => {
      // ボタンがクリックされたときの処理
      console.log('Button clicked!');
      showActionsDialog(bookmarkNode.id);
    });

    // 画像を表示する img 要素を作成
    const image = document.createElement('img');
    image.src = './images/edit.png'; // 画像のパスを設定
    image.alt = 'Image Alt Text'; // 画像の代替テキストを設定

    // img 要素を button 要素に追加
    button.appendChild(image);



    // 生成した <a> 要素を DOM に追加
    li.appendChild(button);
    
    // const removeButton = createRemoveButton(bookmarkNode.id);
    // li.appendChild(removeButton);

    // const moveButton = createMoveButton(bookmarkNode.id);
    // li.appendChild(moveButton);
  }


  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    const childList = dumpTreeNodes(bookmarkNode.children);
    childList.style.display = 'none';  // 初期状態では子ノードを非表示にする
    li.appendChild(childList);
  }

  return li;
}





// ここからHTML以外


// DOMContentLoadedイベントが発生したらブックマーク情報を表示
document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();



  });


// 検索に関する処理
// searchInput 要素を取得
var searchInput = document.getElementById('searchInput');

// searchInput が存在する場合のみ、イベントリスナーを追加
if (searchInput !== null) {
  // 検索入力フィールドの変更イベントを監視して検索を実行
  searchInput.addEventListener('input', searchBookmarks);
}


// 検索結果の表示をリスト形式に変更する関数
function displaySearchResults(results, searchTerm) {
  var bookmarksList = document.getElementById('bookmarksList');
  bookmarksList.innerHTML = ''; // 検索前にリストをクリア

  // 検索結果の処理
  results.forEach(function(bookmark) {
    console.log(bookmark);
    // ブックマークの名前に検索語が含まれる場合のみリストに追加
    if (bookmark.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      var listItem = document.createElement('li');
      var link = document.createElement('a');
      link.textContent = bookmark.title;
      link.href = bookmark.url;
      link.target = '_blank'; // リンクを新しいタブで開く
      listItem.appendChild(link);
      bookmarksList.appendChild(listItem);
    }
  });

  // 検索結果がない場合はメッセージを表示
  if (bookmarksList.childElementCount === 0) {
    var message = document.createElement('p');
    message.textContent = '検索結果がありません';
    bookmarksList.appendChild(message);
  }
}

// ブックマークを名前から検索する関数
function searchBookmarks() {
  var searchInput = document.getElementById('searchInput');
  var searchTerm = searchInput.value.trim();
  console.log(searchTerm);

  // 検索語が空でない場合のみ検索を実行
  if (searchTerm !== '') {
    chrome.bookmarks.search(searchTerm, function(results) {
      displaySearchResults(results, searchTerm); // searchTermを渡す
    });
  }
}




// メッセージリスナーを追加してブックマークの更新を監視
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('message received:', message);
  if (message.action === 'updateBookmarks') {
    console.log('bookmarks updated!');
    window.location.reload();
  }
});




// ボタンクリックイベントリスナー
document.getElementById('arrangeButton').addEventListener('click', () => {
  sortBookmarksToFolder();
});

// フォルダに入っていないブックマークを特定のフォルダに振り分ける関数
function sortBookmarksToFolder() {

  // フォルダに入っていないブックマークの取得
  chrome.bookmarks.getTree((nodes) => {
    // ルートノードの直下にあるブックマークを探す
    const bookmarks = nodes[0].children
    .filter(node => !node.url)  // ルートレベルのフォルダを抽出
    .flatMap(folder => folder.children.filter(subNode => subNode.url))  // 各フォルダの子ノードからフォルダ以外を抽出  
    chrome.runtime.sendMessage({ bookmarks: bookmarks, action: 'sortBookmarks'});
    });
    
  }

  // ブックマークの削除ボタンを作成する関数
function createRemoveButton(bookmarkId) {
  const button = document.createElement('button');
  button.textContent = '削除';
  button.addEventListener('click', () => {
    removeBookmark(bookmarkId);
  });
  return button;
}

// ブックマークを削除する関数
function removeBookmark(bookmarkId) {
  chrome.bookmarks.remove(bookmarkId, () => {
    console.log('Bookmark removed:', bookmarkId);
    chrome.runtime.sendMessage({ action: 'updateBookmarks' });
  });
}

function createMoveButton(bookmarkId) {
  const button = document.createElement('button');
  button.textContent = '移動';
  button.addEventListener('click', async () => {
    
    const folderId = await selectFolder(bookmarkId); // フォルダを選択
    if (folderId) {
      moveBookmark(bookmarkId, folderId); // ブックマークを移動
    }
  });
  return button;
}

async function selectFolder(bookmarkId) {
  return new Promise((resolve) => {
    const folders = []; // ブックマークツリーから取得したフォルダの配列

    // ブックマークツリーを取得してフォルダを抽出
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      const root = bookmarkTreeNodes[0]; // ルートノードを取得
      getAllFolders(root, folders); // 全てのフォルダを取得
       
      // カスタムダイアログを作成
      const dialog = document.createElement('div');
      dialog.style.position = 'fixed';
      dialog.style.top = '50%';
      dialog.style.left = '50%';
      dialog.style.transform = 'translate(-50%, -50%)';
      dialog.style.backgroundColor = '#fff';
      dialog.style.padding = '20px';
      dialog.style.border = '1px solid #ccc';
      dialog.style.zIndex = '9999';
   
      // フォルダ名のリストを表示
      const list = document.createElement('ul');
      folders.forEach((folder, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = folder.title;
        listItem.style.cursor = 'pointer';
        listItem.addEventListener('click', () => {
          dialog.remove(); // ダイアログを閉じる
          resolve(folder.id); // 選択されたフォルダのIDを解決して返す
        });
        list.appendChild(listItem);
      });
   
      // ダイアログにリストを追加
      dialog.appendChild(list);
   
      // ボディにダイアログを追加
      document.body.appendChild(dialog);
    });
  });
}






async function moveBookmark(bookmarkId, folderId) {
  chrome.bookmarks.move(bookmarkId, { parentId: folderId });
}


// ブックマークツリー全体を取得してフォルダを再帰的に抽出
function getAllFolders(node, folders) {
  if (!node.children) return;

  node.children.forEach(child => {
    if (child.url) return; // URL の場合はスキップ
    folders.push(child); // フォルダを追加

    // 子ノードがある場合は再帰的に呼び出す
    if (child.children) {
      getAllFolders(child, folders);
    }
  });
}

chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
  const folders = [];
  getAllFolders(bookmarkTreeNodes[0], folders);
  console.log(folders);
});

function showActionsDialog(bookmarkId) {
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = '#fff';
  dialog.style.padding = '20px';
  dialog.style.border = '1px solid #ccc';
  dialog.style.zIndex = '9999';

  const deleteButton = createRemoveButton(bookmarkId);
  const moveButton = createMoveButton(bookmarkId);
  const backButton = createBackButton(dialog);

  dialog.appendChild(deleteButton);
  dialog.appendChild(moveButton);
  dialog.appendChild(backButton);

  document.body.appendChild(dialog);
}

function createBackButton(dialog) {
  const backButton = document.createElement('button');
  backButton.textContent = '';
  backButton.style.position = 'absolute';
  backButton.style.top = '2px'; // 上端からの距離
  backButton.style.left = '2px'; // 左端からの距離
  backButton.style.backgroundImage = 'url(./images/close.png)';
  backButton.style.backgroundSize = 'cover';
  backButton.style.width = '20px'; // ボタンの幅
  backButton.style.height = '20px'; // ボタンの高さ
  backButton.style.border = 'none'; // ボーダーをなくす
  backButton.addEventListener('click', () => {
    document.body.removeChild(dialog); // ダイアログを閉じる
  });
  return backButton;
}
