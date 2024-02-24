// ファビコンURLを生成する関数
function faviconURL(u) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "64");
  return url.toString();
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

  // ファビコンを表示するためのimg要素を作成
  const img = document.createElement('img');
  img.src = faviconURL(bookmarkNode.url);
  img.className = 'favicon'; // クラス名を追加

  // クリックイベントを追加
  anchor.addEventListener('click', function (event) {
    event.preventDefault();  // デフォルトのリンクの挙動を防止
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
      // 子ノードがある場合はそれを表示
      this.nextSibling.style.display = this.nextSibling.style.display === 'none' ? '' : 'none';
    } else if (bookmarkNode.url) {
      // 子ノードがなく、URLがある場合は新しいタブでリンクを開く
      chrome.tabs.create({ url: bookmarkNode.url });
    }
  });

  const li = document.createElement('li');
  li.className = 'bookmark-item'; // クラス名を追加
  li.appendChild(img); // ファビコンを追加
  li.appendChild(anchor);

  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    const childList = dumpTreeNodes(bookmarkNode.children);
    childList.style.display = 'none';  // 初期状態では子ノードを非表示にする
    li.appendChild(childList);
  }

  return li;
}

// DOMContentLoadedイベントが発生したらブックマーク情報を表示
document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();

  // searchInput 要素を取得
  var searchInput = document.getElementById('searchInput');

  // searchInput が存在する場合のみ、イベントリスナーを追加
  if (searchInput !== null) {
    // 検索入力フィールドの変更イベントを監視して検索を実行
      searchBookmarks();
    }
  });



// 検索結果の表示をリスト形式に変更する関数
function displaySearchResults(results, searchTerm) {
  var bookmarksList = document.getElementById('bookmarksList');
  bookmarksList.innerHTML = ''; // 検索前にリストをクリア

  // 検索結果の処理
  results.forEach(function(bookmark) {
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
