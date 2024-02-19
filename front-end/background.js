let isSidePanelOpen = false;

chrome.action.onClicked.addListener(async () => {
  isSidePanelOpen = !isSidePanelOpen;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (isSidePanelOpen) {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'sidepanel.html',
      enabled: true
    });
  } else {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      enabled: false
    });
  }
});
