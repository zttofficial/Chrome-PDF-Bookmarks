// Debug script to test page detection in PDF viewer
// Open the PDF, press F12, paste this into the console and run it

console.log('=== PDF Page Detection Debug (Enhanced) ===');

// First, check for iframes and embeds
console.log('=== Checking for iframes/embeds ===');
const iframes = document.querySelectorAll('iframe');
const embeds = document.querySelectorAll('embed');
console.log('iframes found:', iframes.length);
console.log('embeds found:', embeds.length);

iframes.forEach((iframe, i) => {
  console.log(`iframe ${i}:`, {
    src: iframe.src,
    id: iframe.id,
    name: iframe.name
  });
});

embeds.forEach((embed, i) => {
  console.log(`embed ${i}:`, {
    src: embed.src,
    type: embed.type,
    id: embed.id
  });
});

// Check shadow DOM
console.log('=== Checking shadow DOM ===');
const elementsWithShadow = [];
document.querySelectorAll('*').forEach(el => {
  if (el.shadowRoot) {
    elementsWithShadow.push({
      tag: el.tagName,
      id: el.id,
      class: el.className
    });
  }
});
console.log('Elements with shadow root:', elementsWithShadow);

console.log('=== Main document checks ===');

// Method 1: pageSelector (the one you found)
const pageSelector = document.getElementById('pageSelector');
console.log('Method 1 - #pageSelector:', {
  found: !!pageSelector,
  value: pageSelector ? pageSelector.value : 'N/A',
  textContent: pageSelector ? pageSelector.textContent : 'N/A',
  innerHTML: pageSelector ? pageSelector.innerHTML : 'N/A',
  placeholder: pageSelector ? pageSelector.placeholder : 'N/A'
});

// Method 2: Check all attributes of pageSelector
if (pageSelector) {
  console.log('pageSelector attributes:', {
    type: pageSelector.type,
    ariaLabel: pageSelector.getAttribute('aria-label'),
    ariaValueNow: pageSelector.getAttribute('aria-valuenow'),
    ariaValueText: pageSelector.getAttribute('aria-valuetext'),
    dataset: pageSelector.dataset
  });
}

// Method 3: Look for text displaying page numbers (like "26 / 355")
const pageTexts = [];
document.querySelectorAll('*').forEach(el => {
  const text = el.textContent;
  if (text && text.match(/^\s*\d+\s*(\/|of)\s*\d+\s*$/i)) {
    pageTexts.push({ element: el.tagName, text: text.trim(), id: el.id, class: el.className });
  }
});
console.log('Method 3 - Elements with "X / Y" pattern:', pageTexts);

// Method 4: Find all inputs
const allInputs = document.querySelectorAll('input');
console.log('Method 4 - All inputs:', allInputs.length);
allInputs.forEach((input, i) => {
  console.log(`  Input ${i}:`, {
    id: input.id,
    value: input.value,
    type: input.type,
    ariaLabel: input.getAttribute('aria-label'),
    placeholder: input.placeholder
  });
});

// Method 5: Check for any element with id containing "page"
const pageElements = document.querySelectorAll('[id*="page" i]');
console.log('Method 5 - Elements with "page" in id:', pageElements.length);
pageElements.forEach((el, i) => {
  console.log(`  ${i}:`, {
    tag: el.tagName,
    id: el.id,
    textContent: el.textContent.substring(0, 50),
    value: el.value
  });
});

// Method 6: Check URL
console.log('Method 6 - URL:', window.location.href);
const hashMatch = window.location.hash.match(/#page=(\d+)/);
console.log('  Page from hash:', hashMatch ? hashMatch[1] : 'NOT FOUND');

// Method 7: Check window object for PDF viewer API
console.log('Method 7 - Window properties:');
console.log('  PDFViewerApplication:', typeof window.PDFViewerApplication);
if (window.PDFViewerApplication) {
  console.log('  PDFViewerApplication.page:', window.PDFViewerApplication.page);
  console.log('  PDFViewerApplication.pagesCount:', window.PDFViewerApplication.pagesCount);
  console.log('  PDFViewerApplication.pdfViewer:', typeof window.PDFViewerApplication.pdfViewer);
  if (window.PDFViewerApplication.pdfViewer) {
    console.log('  PDFViewerApplication.pdfViewer.currentPageNumber:', window.PDFViewerApplication.pdfViewer.currentPageNumber);
  }
}

// Method 8: Look for any span/div showing current page
const possiblePageDisplays = document.querySelectorAll('span, div');
const pageNumberDisplays = [];
possiblePageDisplays.forEach(el => {
  const text = el.textContent.trim();
  if (text && /^\d+$/.test(text) && parseInt(text) > 0 && parseInt(text) < 10000) {
    pageNumberDisplays.push({
      tag: el.tagName,
      text: text,
      id: el.id,
      class: el.className,
      parent: el.parentElement ? el.parentElement.tagName : 'none'
    });
  }
});
console.log('Method 8 - Standalone numbers (possible page numbers):', pageNumberDisplays.slice(0, 10));

console.log('=== End Debug ===');
