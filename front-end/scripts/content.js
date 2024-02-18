// ブックマークの情報を取得してサイドバーに表示する関数
function displayBookmarks() {
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    const bookmarks = bookmarkTreeNodes[0].children[0].children; // ルートフォルダの直下のブックマークを取得

    // サイドバーのHTMLを作成
    const sidebar = document.createElement("div");
    sidebar.id = "mySidebar";
    sidebar.style.width = "250px";
    sidebar.style.height = "100%";
    sidebar.style.position = "fixed";
    sidebar.style.top = "0";
    sidebar.style.right = "0";
    sidebar.style.color = "#f4f4f4";
    sidebar.style.backgroundColor = "#f00";
    sidebar.style.zIndex = "2147483647";
    sidebar.style.overflowY = "auto";

    // ブックマークの情報をサイドバーに追加
    const ul = document.createElement("ul");
    bookmarks.forEach(function(bookmark) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = bookmark.url;
      a.textContent = bookmark.title;
      li.appendChild(a);
      ul.appendChild(li);
    });

    sidebar.appendChild(ul);

    // サイドバーをページに追加
    document.body.appendChild(sidebar);
  });
}

// ブックマークの情報を取得して表示
displayBookmarks();
