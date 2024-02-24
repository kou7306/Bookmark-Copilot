// HTML要素を作成します
let icon = document.createElement('img');

// アイコンのソースを設定します
icon.src = './images/back.png';

// アイコンにクリックイベントリスナーを追加します
icon.addEventListener('click', function() {
    window.location.reload();
});

// アイコンにクラスを追加します
icon.className = 'reload-icon';

// アイコンをbodyに追加します
document.body.appendChild(icon);

icon.style.display = 'none';

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
  //　フォルダのみを最初に表示する
  for (let i = 0; i < bookmarkNodes.length; i++) {

  // ノードがフォルダであるかどうかをチェック
  if (bookmarkNodes[i].children) {
    // フォルダの場合、処理を行う
    list.appendChild(dumpNode(bookmarkNodes[i]));
  }

  }
  // フォルダ以外のノードを表示する
  for (let i = 0; i < bookmarkNodes.length; i++) {
    if (!bookmarkNodes[i].children) {
      list.appendChild(dumpNode(bookmarkNodes[i]));
    }
  }


  //最終アクセス日時ソート系処理
  // フォルダ以外のノードを表示する
  // let bookmarks = [];

  // // ブックマークを抽出
  // for (let i = 0; i < bookmarkNodes.length; i++) {
  //   if (!bookmarkNodes[i].children) {
  //     bookmarks.push(bookmarkNodes[i]);
  //   }
  // }
  
  // // 履歴の最終アクセス日時を取得してブックマークをソート
  // getBookmarkAccessTimes(bookmarks).then(sortedBookmarks => {
  //   // ソートされたブックマークを処理
  //   for (let bookmark of sortedBookmarks) {
  //     // ここでブックマークを表示するなどの処理を行う
  //     list.appendChild(dumpNode(bookmark));
  //   }
  // });

  return list;
}


// // ブックマークの履歴の最終アクセス日時を取得してソートする関数
// function getBookmarkAccessTimes(bookmarks) {
//   return Promise.all(bookmarks.map(bookmark => {
//     return new Promise(resolve => {
//       chrome.history.search({text: bookmark.url, maxResults: 1}, historyItems => {
//         if (historyItems.length > 0) {
//           bookmark.lastVisitTime = historyItems[0].lastVisitTime;
//         } else {
//           bookmark.lastVisitTime = 0; // 履歴がない場合は0とする
//         }
//         resolve(bookmark);
//       });
//     });
//   })).then(bookmarks => {
//     // 最終アクセス日時でソート
//     return bookmarks.sort((a, b) => b.lastVisitTime - a.lastVisitTime);
//   });
// }


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

  if (bookmarkNode.children) {
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
        icon.style.display = 'block';
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

if (searchInput == null) {
  window.location.reload();
}

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
 
    // ブックマークの名前に検索語が含まれる場合のみリストに追加

    bookmarksList.appendChild(dumpNode(bookmark));

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
  

  // 検索語が空でない場合に検索を実行
  if (searchTerm) {
    chrome.bookmarks.search(searchTerm, function(results) {
      displaySearchResults(results, searchTerm);
    });
  } else {
    window.location.reload();
  }
}

// ブックマークツリーからブックマークを抽出する関数
function extractBookmarks(nodes, bookmarks) {
  nodes.forEach(function(node) {
    if (node.children) {
      extractBookmarks(node.children, bookmarks);
    } else {
      bookmarks.push(node);
    }
  });
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
  button.style.width = '50px';
  button.addEventListener('click', () => {
    removeBookmark(bookmarkId);
  });
  return button;
}

// ブックマークを削除する関数
function removeBookmark(bookmarkId) {
  // 確認用のダイアログを表示し、"OK" が選択された場合のみブックマークを削除する
  if (confirm('ほんとに削除してもよろしいですか?')) {
    chrome.bookmarks.remove(bookmarkId, () => {
      console.log('Bookmark removed:', bookmarkId);
      chrome.runtime.sendMessage({ action: 'updateBookmarks' });

    });
  }
}


function createMoveButton(bookmarkId,dialog) {
  const button = document.createElement('button');
  button.textContent = '移動';
  button.style.width = '50px';
  button.addEventListener('click', async () => {
    dialog.remove(); // ダイアログを閉じる
    
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
      const backButton = createBackButton(dialog,false,bookmarkId,null);
      // ダイアログにリストを追加
      dialog.appendChild(list);
      dialog.appendChild(backButton);
   
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
  // オーバーレイが存在しない場合のみ作成
  if (!document.getElementById('overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'overlay'; // ID を設定して後から取得できるようにする
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // 半透明の黒
    overlay.style.zIndex = '9998'; // ダイアログよりも背面に配置
    document.body.appendChild(overlay);
  }
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
  const moveButton = createMoveButton(bookmarkId,dialog);
  const backButton = createBackButton(dialog,true,bookmarkId,overlay);

  dialog.appendChild(deleteButton);
  dialog.appendChild(moveButton);
  dialog.appendChild(backButton);

  document.body.appendChild(dialog);

}

function createBackButton(dialog,flag,bookmarkId,overlay) {
  const backButton = document.createElement('button');
  backButton.textContent = '';
  backButton.style.position = 'absolute';
  backButton.style.top = '2px'; // 上端からの距離
  backButton.style.left = '2px'; // 左端からの距離
  if(flag){
    backButton.style.backgroundImage = 'url(./images/close.png)';
  }
  else{
    backButton.style.backgroundImage = 'url(./images/back.png)';
  }
  backButton.style.backgroundSize = 'cover';
  backButton.style.width = '20px'; // ボタンの幅
  backButton.style.height = '20px'; // ボタンの高さ
  backButton.style.border = 'none'; // ボーダーをなくす
  backButton.addEventListener('click', () => {
    if (flag){
      dialog.remove();
      overlay.remove();
    }
    else{
      dialog.remove(); // ダイアログを閉じる
      
      showActionsDialog(bookmarkId);
    }
    
  });
  return backButton;
}
