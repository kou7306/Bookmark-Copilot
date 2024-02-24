// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'define-word',
    title: 'Define',
    contexts: ['selection']
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data) => {
  chrome.runtime.sendMessage({
    name: 'define-word',
    data: { value: data.selectionText }
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

//  ブックマークイベントを受け取る
chrome.bookmarks.onCreated.addListener(function(id, bookmarkNode) {
  console.log('New bookmark added:', bookmarkNode.url);
  selectFolder(bookmarkNode);
  chrome.runtime.sendMessage({ action: 'updateBookmarks' });
});

// ブックマークのフォルダを変更する関数
function selectFolder(bookmarkNode) {
  const url = bookmarkNode.url;
  getRootBookmarkFolders()  // ルートにあるブックマークのフォルダ情報を取得
    .then(folders => {
      console.log('Sending folders to API:', folders);
      return sendRequestToApi(url, folders).then(response => {
        console.log('API response:', response.folder);
        return { response, folders };  // APIレスポンスとフォルダリストを次のステップに渡す
      });
    })
    .then(({ response, folders }) => {
      
      const recommendedFolderName = findMatchingFolderName(response.folder, folders);  // レスポンスからフォルダ名を探す
      return findFolderId(recommendedFolderName);  // フォルダ名に対応するフォルダIDを探す
    })
    .then(folderId => {
      if (folderId) {
        
        // フォルダIDが見つかった場合、ブックマークをそのフォルダに移動
        chrome.bookmarks.move(bookmarkNode.id, { parentId: folderId }); 
        console.log('Moved bookmark to folder:', folderId);

        
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// APIにリクエストを送信する関数
function sendRequestToApi(url,folderData) {
  const apiUrl = 'https://asia-northeast1-bookmarkai-414803.cloudfunctions.net/get_url_info';
  const requestBody = {
    url: url,
    folderData: folderData
  };
  console.log('Sending request to API:', requestBody);
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  .then(response => response.json())
  .then(data => {
    console.log('folder response:', data.folder);
    return data;
  });
}

// ルートにあるブックマークのフォルダ情報を取得する関数
function getRootBookmarkFolders() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      const Folders = bookmarkTreeNodes[0].children
    .filter(node => !node.url)  // ルートレベルのフォルダを抽出
    .flatMap(folder => folder.children.filter(subNode => !subNode.url))  // 各フォルダの子ノードからさらにフォルダを抽出
    .map(subFolder => subFolder.title);  // フォルダ名を抽出
      resolve(Folders);
    });
  });
}


// フォルダ名に対応するフォルダIDを探す関数
function findFolderId(folderName) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      // ルートフォルダの一つ下の階層のフォルダを取得
      const subFolders = bookmarkTreeNodes[0].children
        .filter(node => !node.url)
        .flatMap(folder => folder.children.filter(subNode => !subNode.url));

      // さらに一つ下の階層のフォルダから、指定されたフォルダ名に一致するフォルダを探す
      const matchingFolder = subFolders.find(folder => folder.title === folderName);
      resolve(matchingFolder ? matchingFolder.id : null);
    });
  });
}


// レスポンス文字列に含まれるフォルダ名を探す関数
function findMatchingFolderName(responseText, folderNames) {
  for (const folderName of folderNames) {
    if (responseText.includes(folderName)) {
      return folderName;
    }
  }
  return null;
}






// メッセージリスナーを追加してブックマークの更新を監視
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sortBookmarks') {
    console.log('sorted bookmark list:', message.bookmarks);
    message.bookmarks.forEach(bookmark => {
      selectFolder(bookmark);
    });
  }


});

// ブックマークが移動されたときのイベントリスナー
chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
  console.log('Bookmark moved:', moveInfo);
  // 移動されたブックマークの処理を行う
  chrome.runtime.sendMessage({ action: 'updateBookmarks' });
});

chrome.bookmarks.onRemoved.addListener(() => {
  chrome.runtime.sendMessage({ action: 'updateBookmarks' });
});
