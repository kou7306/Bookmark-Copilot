// Traverse the bookmark tree, and print the folder and nodes.
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
  anchor.setAttribute('href', bookmarkNode.url);
  anchor.textContent = bookmarkNode.title;

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
