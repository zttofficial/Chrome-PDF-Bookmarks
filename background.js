// Background service worker for Chrome PDF Bookmarks extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome PDF Bookmarks extension installed/updated');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageChanged') {
    // Store current page information
    if (sender.tab) {
      chrome.storage.local.set({
        [`currentPage_${sender.tab.id}`]: request.page
      });
    }
  }
  return true;
});