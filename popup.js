// Chrome PDF Bookmarks - Popup Script

let currentTab = null;
let currentPdfUrl = null;
let detectedPage = null;

// DOM Elements
const bookmarkNameInput = document.getElementById('bookmarkName');
const currentPageInput = document.getElementById('currentPage');
const addBookmarkBtn = document.getElementById('addBookmark');
const detectPageBtn = document.getElementById('detectPage');
const bookmarksListDiv = document.getElementById('bookmarksList');
const pdfNameSpan = document.getElementById('pdfName');
const pageInfoSpan = document.getElementById('pageInfo');
const errorMessageDiv = document.getElementById('errorMessage');

// Initialize popup
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    if (!isPdfUrl(tab.url)) {
      showError('This extension only works on PDF files. Please open a PDF document.');
      disableControls();
      return;
    }

    currentPdfUrl = cleanUrl(tab.url);
    updatePdfInfo(tab.url);
    await loadBookmarks();
    
    // Try to detect current page from URL immediately
    const pageFromUrl = getPageFromUrl(tab.url);
    if (pageFromUrl) {
      currentPageInput.value = pageFromUrl;
      pageInfoSpan.textContent = `Page ${pageFromUrl}`;
      console.log('✓ Page auto-detected from URL:', pageFromUrl);
    } else {
      console.log('ℹ No page in URL yet - navigate in PDF or click Detect');
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize extension. Please refresh the page.');
  }
}

function isPdfUrl(url) {
  return url && (url.endsWith('.pdf') || url.includes('.pdf#') || url.includes('.pdf?'));
}

function cleanUrl(url) {
  // Remove hash and query parameters to get the base PDF URL
  return url.split('#')[0].split('?')[0];
}

function updatePdfInfo(url) {
  const filename = url.split('/').pop().split('#')[0].split('?')[0];
  const displayName = decodeURIComponent(filename);
  pdfNameSpan.textContent = displayName;
  
  // Auto-fill bookmark name with PDF filename (without extension)
  const nameWithoutExt = displayName.replace(/\.pdf$/i, '');
  if (bookmarkNameInput && !bookmarkNameInput.value) {
    bookmarkNameInput.value = nameWithoutExt;
  }
  
  return nameWithoutExt;
}

function showError(message) {
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = 'block';
  setTimeout(() => {
    errorMessageDiv.style.display = 'none';
  }, 5000);
}

function disableControls() {
  bookmarkNameInput.disabled = true;
  currentPageInput.disabled = true;
  addBookmarkBtn.disabled = true;
  detectPageBtn.disabled = true;
}

// Detect current page from PDF viewer
async function detectCurrentPage(updateNameWithPage = false) {
  console.log('🔍 Starting page detection...');
  console.log('Current tab URL:', currentTab.url);
  
  // IMPORTANT: Chromium-based PDF Reader (PDFium) is isolated from the HTML carrier.
  // The PDF viewer runs in an embedded APPLICATION/PDF frame that is NOT accessible to JavaScript.
  // Unlike PDF.js (Firefox), we cannot directly read the PDF viewer's internal state.
  // 
  // Reference: https://stackoverflow.com/questions/tagged/chrome-pdf-viewer
  // "The toolbars of Acrobat powered Edge or PDFium powered Chrome, are not generally 
  //  accessible outside their embedded frames."
  //
  // Best practice: Use URL hash (#page=N) for page navigation and detection.
  
  // Method 1: Parse page from URL hash (MOST RELIABLE for Chrome PDF viewer)
  const hashMatch = currentTab.url.match(/#page=(\d+)/);
  if (hashMatch) {
    const pageNum = parseInt(hashMatch[1]);
    console.log(`✓ Page detected from URL hash: ${pageNum}`);
    
    detectedPage = pageNum;
    currentPageInput.value = pageNum;
    
    // Update bookmark name with page number if requested
    if (updateNameWithPage && bookmarkNameInput) {
      const currentName = bookmarkNameInput.value || '';
      const baseName = currentName.replace(/\s*-?\s*Page\s*\d+$/i, '').trim();
      bookmarkNameInput.value = `${baseName} - Page ${pageNum}`.trim();
      
      setTimeout(() => {
        const startPos = bookmarkNameInput.value.lastIndexOf('Page');
        if (startPos >= 0) {
          bookmarkNameInput.setSelectionRange(startPos, bookmarkNameInput.value.length);
        }
        bookmarkNameInput.focus();
      }, 50);
    }
    
    pageInfoSpan.textContent = `Page ${pageNum}`;
    return true;
  }
  
  // Method 2: Try to inject script (may work in older Chrome versions)
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id, allFrames: true },
      func: () => {
        // Try PDFViewerApplication API
        if (typeof window.PDFViewerApplication !== 'undefined' && window.PDFViewerApplication.page) {
          return {
            currentPage: window.PDFViewerApplication.page,
            totalPages: window.PDFViewerApplication.pagesCount,
            method: 'PDFViewerApplication'
          };
        }
        
        // Try common selectors
        const pageInput = document.getElementById('pageSelector') || 
                         document.getElementById('pageNumber');
        if (pageInput && pageInput.value) {
          const pageNum = parseInt(pageInput.value);
          if (!isNaN(pageNum) && pageNum > 0) {
            return { currentPage: pageNum, method: 'input-element' };
          }
        }
        
        return null;
      }
    });
    
    for (const result of results) {
      if (result && result.result && result.result.currentPage) {
        const { currentPage, totalPages, method } = result.result;
        console.log(`✓ Page detected via ${method}: ${currentPage}`);
        
        detectedPage = currentPage;
        currentPageInput.value = currentPage;
        
        if (updateNameWithPage && bookmarkNameInput) {
          const currentName = bookmarkNameInput.value || '';
          const baseName = currentName.replace(/\s*-?\s*Page\s*\d+$/i, '').trim();
          bookmarkNameInput.value = `${baseName} - Page ${currentPage}`.trim();
          
          setTimeout(() => {
            const startPos = bookmarkNameInput.value.lastIndexOf('Page');
            if (startPos >= 0) {
              bookmarkNameInput.setSelectionRange(startPos, bookmarkNameInput.value.length);
            }
            bookmarkNameInput.focus();
          }, 50);
        }
        
        pageInfoSpan.textContent = totalPages ? `Page ${currentPage} / ${totalPages}` : `Page ${currentPage}`;
        return true;
      }
    }
  } catch (error) {
    console.log('⚠️ Cannot inject script (Chrome PDF viewer isolation):', error.message);
  }
  
  // Failed to detect - show helpful message
  console.log('✗ Unable to detect page. User needs to navigate to a page first.');
  pageInfoSpan.textContent = 'Navigate to page first';
  return false;
}

function getPageFromUrl(url) {
  const match = url.match(/#page=(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Storage key for bookmarks of specific PDF
function getStorageKey() {
  return `bookmarks_${btoa(currentPdfUrl).substring(0, 50)}`;
}

// Load bookmarks for current PDF
async function loadBookmarks() {
  const storageKey = getStorageKey();
  const result = await chrome.storage.sync.get(storageKey);
  const bookmarks = result[storageKey] || [];
  
  renderBookmarks(bookmarks);
}

// Render bookmarks list
function renderBookmarks(bookmarks) {
  if (!bookmarks || bookmarks.length === 0) {
    bookmarksListDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📖</div>
        <div>No bookmarks yet</div>
        <div style="font-size: 12px; margin-top: 5px;">Add your first bookmark above</div>
      </div>
    `;
    return;
  }

  // Sort bookmarks by page number
  bookmarks.sort((a, b) => a.page - b.page);

  bookmarksListDiv.innerHTML = bookmarks.map((bookmark, index) => `
    <div class="bookmark-item">
      <div class="bookmark-info" data-index="${index}">
        <div class="bookmark-name">${escapeHtml(bookmark.name)}</div>
        <div class="bookmark-page">Page ${bookmark.page}</div>
      </div>
      <button class="btn-delete" data-index="${index}">Delete</button>
    </div>
  `).join('');

  // Add click listeners
  bookmarksListDiv.querySelectorAll('.bookmark-info').forEach(el => {
    el.addEventListener('click', () => jumpToBookmark(bookmarks[el.dataset.index]));
  });

  bookmarksListDiv.querySelectorAll('.btn-delete').forEach(el => {
    el.addEventListener('click', () => deleteBookmark(parseInt(el.dataset.index)));
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add new bookmark
async function addBookmark() {
  const name = bookmarkNameInput.value.trim();
  const page = parseInt(currentPageInput.value);

  if (!name) {
    showError('Please enter a bookmark name');
    bookmarkNameInput.focus();
    return;
  }

  if (!page || page < 1) {
    showError('Please enter a valid page number');
    currentPageInput.focus();
    return;
  }

  const storageKey = getStorageKey();
  const result = await chrome.storage.sync.get(storageKey);
  const bookmarks = result[storageKey] || [];

  // Add new bookmark
  bookmarks.push({
    name: name,
    page: page,
    createdAt: Date.now()
  });

  // Save to storage
  await chrome.storage.sync.set({ [storageKey]: bookmarks });

  // Clear inputs
  bookmarkNameInput.value = '';
  currentPageInput.value = '';
  bookmarkNameInput.focus();

  // Reload list
  await loadBookmarks();
}

// Delete bookmark
async function deleteBookmark(index) {
  const storageKey = getStorageKey();
  const result = await chrome.storage.sync.get(storageKey);
  const bookmarks = result[storageKey] || [];

  // Remove bookmark
  bookmarks.splice(index, 1);

  // Save to storage
  await chrome.storage.sync.set({ [storageKey]: bookmarks });

  // Reload list
  await loadBookmarks();
}

// Jump to bookmark
async function jumpToBookmark(bookmark) {
  const targetUrl = `${currentPdfUrl}#page=${bookmark.page}`;
  
  console.log('Jumping to bookmark:', bookmark.name, 'page:', bookmark.page);
  console.log('Target URL:', targetUrl);
  console.log('Current URL:', currentTab.url);
  
  try {
    // For Chrome PDF viewer, we need to update URL and reload
    if (currentTab.url.split('#')[0] === currentPdfUrl) {
      // Same PDF, just different page - update hash and reload
      await chrome.tabs.update(currentTab.id, { url: targetUrl });
      // Give it a moment to update the URL
      setTimeout(async () => {
        await chrome.tabs.reload(currentTab.id);
        window.close();
      }, 100);
    } else {
      // Different PDF or first time - just navigate
      await chrome.tabs.update(currentTab.id, { url: targetUrl });
      setTimeout(() => window.close(), 100);
    }
  } catch (error) {
    console.error('Error navigating:', error);
    // Fallback: open in new tab
    chrome.tabs.create({ url: targetUrl });
    window.close();
  }
}

// Event listeners
addBookmarkBtn.addEventListener('click', addBookmark);

detectPageBtn.addEventListener('click', async () => {
  // Visual feedback
  const originalText = detectPageBtn.textContent;
  detectPageBtn.textContent = '🔄 Detecting...';
  detectPageBtn.disabled = true;
  
  // Update bookmark name with page number when clicking detect
  const detected = await detectCurrentPage(true);
  
  // Re-enable button
  detectPageBtn.disabled = false;
  detectPageBtn.textContent = originalText;
  
  if (!detected) {
    // Provide helpful feedback if detection failed
    showError('Unable to auto-detect. Please navigate to a page in the PDF (use ← → or page controls), then try again. Or enter the page number manually.');
  }
});

bookmarkNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    currentPageInput.focus();
  }
});

currentPageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBookmark();
  }
});

// Initialize when popup opens
init();