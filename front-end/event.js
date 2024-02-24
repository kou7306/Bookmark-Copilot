document.getElementById('createFolder').addEventListener('click', function() {
    var folderName = prompt('新しいフォルダの名前を入力してください:');
    if (folderName) {
        chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
            // ルートノードの子ノード（直下のフォルダ）を取得
            const rootChildren = bookmarkTreeNodes[0].children;
            if (rootChildren && rootChildren.length > 0) {
                // 最初の子ノード（ルートノードの直下の最初のフォルダ）のIDを親フォルダのIDとして使用
                const parentId = rootChildren[0].id;
                chrome.bookmarks.create({
                    'parentId': parentId,
                    'title': folderName
                }, function(newFolder) {
                    console.log('新しいフォルダが作成されました: ', newFolder);
                    // ここで新しいフォルダに関する処理を行う
                });
            } else {
                console.error('ルートノードにフォルダが見つかりませんでした。');
            }
        });
    }
});
