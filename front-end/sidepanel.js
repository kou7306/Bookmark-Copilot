function createBookmarkElement(bookmark) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = bookmark.url;
    a.textContent = bookmark.title;
    a.target = '_blank';
    li.appendChild(a);
    return li;
  }
  
  function renderBookmarks(bookmarks) {
    const list = document.getElementById('bookmark-list');
    list.innerHTML = '';
    bookmarks.forEach(bookmark => {
      if (bookmark.url) {
        list.appendChild(createBookmarkElement(bookmark));
      }
      if (bookmark.children) {
        renderBookmarks(bookmark.children);
      }
    });
  }
  
  chrome.bookmarks.getTree().then(bookmarks => {
    renderBookmarks(bookmarks);
  });
  
  