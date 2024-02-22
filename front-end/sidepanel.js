// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    document.getElementById('bookmarks').appendChild(dumpTreeNodes(bookmarkTreeNodes));
    console.log(bookmarkTreeNodes);
  });
}

function dumpTreeNodes(bookmarkNodes) {
  const list = document.createElement('ul');
  list.className = 'bookmark-list'; // クラス名を追加
  console.log(bookmarkNodes);
  
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
    event.preventDefault();  // デフォルトのリンクの挙動を防止
    chrome.tabs.create({ url: bookmarkNode.url });  // 新しいタブでリンクを開く
  });

  const li = document.createElement('li');
  li.className = 'bookmark-item'; // クラス名を追加
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
