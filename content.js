// Content script for PDF page detection
// This script runs in the context of PDF viewer pages

// Check if we're in a PDF context
function isPdfPage() {
  return window.location.href.includes('.pdf') || 
         document.contentType === 'application/pdf' ||
         document.querySelector('embed[type="application/pdf"]') !== null;
}

function getCurrentPageFromURL() {
  const match = window.location.hash.match(/#page=(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function getTotalPages() {
  // Try to get total pages from the PDF viewer
  const pageSelector = document.querySelector('#pageNumber');
  if (pageSelector) {
    const totalPagesElement = document.querySelector('#numPages');
    if (totalPagesElement) {
      return parseInt(totalPagesElement.textContent);
    }
  }
  return null;
}

function getCurrentPageFromViewer() {
  // Chrome's PDF viewer has a page number input field
  const pageSelector = document.querySelector('#pageNumber');
  if (pageSelector && pageSelector.value) {
    const pageNum = parseInt(pageSelector.value);
    if (!isNaN(pageNum)) {
      return pageNum;
    }
  }
  
  // Fallback to URL hash
  return getCurrentPageFromURL();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentPage') {
    // Wait a bit to ensure page is loaded
    setTimeout(() => {
      const currentPage = getCurrentPageFromViewer();
      const totalPages = getTotalPages();
      sendResponse({ 
        currentPage: currentPage, 
        totalPages: totalPages,
        url: window.location.href.split('#')[0] // Clean URL without hash
      });
    }, 100);
    return true; // Keep the message channel open for async response
  }
  return false;
});

// Monitor page changes and update the extension
let lastPage = getCurrentPageFromViewer();

function monitorPageChanges() {
  const currentPage = getCurrentPageFromViewer();
  if (currentPage !== lastPage && currentPage !== null) {
    lastPage = currentPage;
    // Notify background script about page change
    chrome.runtime.sendMessage({
      action: 'pageChanged',
      page: currentPage
    }).catch(() => {
      // Ignore errors if popup is not open
    });
  }
}

// Watch for hash changes
window.addEventListener('hashchange', monitorPageChanges);

// Watch for page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(monitorPageChanges, 500);
  });
} else {
  setTimeout(monitorPageChanges, 500);
}

// Also poll periodically as backup (PDF viewer might update without hash change)
setInterval(monitorPageChanges, 2000);
