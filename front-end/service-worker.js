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
  url=bookmarkNode.url;
  getRootBookmarkFolders() // ルートにあるブックマークのフォルダ情報を取得
  .then(folders => {
    console.log('Sending folders to API:', folders);
    return sendRequestToApi(folders);
  })
  .then(response => {
    console.log('API response:', response.folder);
  })
  .catch(error => {
    console.error('Error:', error);
  }); 

});

// APIにリクエストを送信する関数
function sendRequestToApi(folderData) {
  const apiUrl = 'https://asia-northeast1-bookmarkai-414803.cloudfunctions.net/get_url_info';
  const requestBody = {
    url: url,
    folderData: folderData
  };
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  .then(response => response.json());
}

// ルートにあるブックマークのフォルダ情報を取得する関数
function getRootBookmarkFolders() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      const rootFolders = bookmarkTreeNodes[0].children.filter(node => !node.url).map(folder => folder.title);
      resolve(rootFolders);
    });
  });
}