// Traverse the bookmark tree, and print the folder and nodes.
document.addEventListener('DOMContentLoaded', function() {
  // searchInput 要素を取得
  var searchInput = document.getElementById('searchInput');
  
  // searchInput が存在する場合のみ、イベントリスナーを追加
  if (searchInput !== null) {
    // 検索入力フィールドの変更イベントを監視して検索を実行
    searchInput.addEventListener('input', function() {
      searchBookmarks();
    });
  }

  var openPopupButton = document.getElementById('openPopupButton');
  openPopupButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'sidepanel.html' });
  });

  // ブックマークの読み込みと表示
  loadBookmarks();

   // 削除ボタンのクリックイベントを設定
  var deleteSelectedButton = document.getElementById('deleteSelectedButton');
  deleteSelectedButton.addEventListener('click', function() {
      deleteSelectedBookmarks();
  });
  
});

// ブックマークをロードして表示する関数
function loadBookmarks() {
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    displayBookmarks(bookmarkTreeNodes[0].children);
  });
}


// ブックマークを表示する関数
function displayBookmarks(bookmarks) {
  var bookmarksList = document.getElementById('bookmarksList');
  bookmarksList.innerHTML = '';

  bookmarks.forEach(function(bookmark) {
      var li = document.createElement('li');
      
      // チェックボックスを作成し、li要素に追加
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = bookmark.id; // ブックマークのIDをチェックボックスの値として設定
      li.appendChild(checkbox);

      // ブックマークのタイトルをli要素に追加
      var title = document.createElement('span');
      title.textContent = bookmark.title;
      li.appendChild(title);
      
      bookmarksList.appendChild(li);
  });
}

// ブックマークを削除する関数
function deleteBookmark(bookmarkId) {
  chrome.bookmarks.remove(bookmarkId, function() {
    loadBookmarks(); // ブックマークを削除した後に再度ブックマークを読み込んで表示する
  });
}


// 選択されたブックマークを削除する関数
function deleteSelectedBookmarks() {
  var bookmarksList = document.getElementById('bookmarksList');
  var checkboxes = bookmarksList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(function(checkbox) {
      if (checkbox.checked) {
          deleteBookmark(checkbox.value);
      }
  });
}



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


function dumpBookmarks() {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    document.getElementById('bookmarks').appendChild(dumpTreeNodes(bookmarkTreeNodes));
  });
}

function dumpTreeNodes(bookmarkNodes) {
  const list = document.createElement('ul');
  for (let i = 0; i < bookmarkNodes.length; i++) {
    list.appendChild(dumpNode(bookmarkNodes[i]));
  }

  return list;
}

function dumpNode(bookmarkNode) {
  const anchor = document.createElement('a');
  anchor.textContent = bookmarkNode.title;

  // クリックイベントを追加
  anchor.addEventListener('click', function (event) {
    event.preventDefault();  // デフォルトのリンクの挙動を防止
    chrome.tabs.create({ url: bookmarkNode.url });  // 新しいタブでリンクを開く
  });

  const li = document.createElement('li');
  li.appendChild(anchor);

  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    li.appendChild(dumpTreeNodes(bookmarkNode.children));
  }

  return li;
}


// DOMContentLoadedイベントが発生したらブックマーク情報を表示
document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();
});
