// ファビコンURLを生成する関数
function faviconURL(u) {
  try {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "64");
    return url.toString();
  } catch (error) {
    console.error("Error constructing favicon URL:", error);
    return ""; // or provide a default favicon URL
  }
}

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


    // テキストの文字数制限
    const maxLength = 12; // 最大の文字数
    let text = bookmarkNode.title;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...'; // 切り詰める
    }
    anchor.textContent = text;


  // ファビコンを表示するためのimg要素を作成
  const img = document.createElement('img');
  img.className = 'favicon'; // クラス名を追加

  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    // フォルダの場合はデフォルトで閉じているアイコンを表示
    img.src = 'icons/folder_96.png';
  } else if (bookmarkNode.url) {
    // ブックマークの場合はファビコンを表示
    img.src = faviconURL(bookmarkNode.url);
  }

  // ファビコンのクリックイベントを追加
  img.addEventListener('click', function (event) {
    event.preventDefault();  // デフォルトのリンクの挙動を防止
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
      // 子ノードがある場合はそれを表示
      const childList = this.nextSibling.nextSibling;
      childList.style.display = childList.style.display === 'none' ? '' : 'none';
      // フォルダの開閉状態に応じてアイコンを切り替え
      this.src = childList.style.display === 'none' ? 'icons/folder_96.png' : 'icons/folder_opened_96.png';

      // フォルダが開かれたとき、サイドバーをクリアしてからその中身を表示
      if (childList.style.display !== 'none') {
        const sidebar = document.getElementById('bookmarks');
        sidebar.innerHTML = ''; // サイドバーをクリア
        sidebar.appendChild(dumpTreeNodes(bookmarkNode.children)); // フォルダの中身を表示
      }
    } else if (bookmarkNode.url) {
      // 子ノードがなく、URLがある場合は新しいタブでリンクを開く
      chrome.tabs.create({ url: bookmarkNode.url });
    }
  });

  const li = document.createElement('li');
  li.className = 'bookmark-item'; // クラス名を追加
  li.appendChild(img); // ファビコンを追加
  li.appendChild(anchor);
  if (bookmarkNode.url) {
    // 削除ボタンを追加
    const removeButton = createRemoveButton(bookmarkNode.id);
    li.appendChild(removeButton);

    const moveButton = createMoveButton(bookmarkNode.id);
    li.appendChild(moveButton);
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
    
    const folderId = await selectFolder(); // フォルダを選択
    if (folderId) {
      moveBookmark(bookmarkId, folderId); // ブックマークを移動
    }
  });
  return button;
}
async function selectFolder() {
  return new Promise((resolve) => {
    const folders = []; // ブックマークツリーから取得したフォルダの配列

    // ブックマークツリーを取得してフォルダを抽出
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      const folders = bookmarkTreeNodes[0].children
    .filter(node => !node.url)  // ルートレベルのフォルダを抽出
    .flatMap(folder => folder.children.filter(subNode => !subNode.url))  // 各フォルダの子ノードからさらにフォルダを抽出
 
  

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
