# Chrome-PDF-Bookmarks
Add and manage multiple bookmarks in Chrome's native PDF viewer.

## ✨ Features

- **📚 Multiple Bookmarks per PDF** - Save unlimited bookmarks for each PDF document
- **🔍 Auto Page Detection** - Automatically detect the current page you're viewing
- **📁 PDF-Specific Storage** - Bookmarks are stored separately for each PDF file
- **🎨 Modern UI** - Clean, intuitive interface with gradient design
- **⚡ Quick Navigation** - Jump to any saved bookmark with one click
- **💾 Persistent Storage** - Your bookmarks sync across Chrome instances
- **🏷️ Named Bookmarks** - Give meaningful names to your bookmarks

## 🚀 Installation

### Option 1: Load Unpacked Extension (Development)
1. Clone this repository or download the ZIP
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. **Important for local PDFs**: Click "Details" on the extension card, then enable "Allow access to file URLs"
6. The PDF Bookmarks icon will appear in your toolbar

### Option 2: Install from Release (Recommended)
1. Download the latest `.crx` file from **Releases**
2. Drag and drop it into `chrome://extensions/`
3. Click "Add Extension" when prompted

## 📖 How to Use

### Quick Start
1. **Open a PDF file** in Chrome (local or web)
2. **Navigate to a specific page** in the PDF viewer:
   - Type a page number in the PDF toolbar and press Enter
   - Use keyboard shortcuts: Page Down/Up, Arrow keys
   - Click on the page navigation buttons
   - After navigation, the URL will update to include `#page=N`
3. **Click the extension icon** in your toolbar
4. **Your bookmark name is auto-filled** with the PDF filename
5. **Page number is auto-detected** from the URL (if you navigated in step 2)
   - If not detected, click "🔍 Detect" or simply type the page number
6. **Adjust the bookmark name** if needed and **click "+ Add"** to save
7. **Click any saved bookmark** to jump to that page instantly

### Why Do I Need to Navigate First?

Chrome's PDF viewer (PDFium) is isolated from web page JavaScript for security. The viewer toolbar and controls are in an embedded frame that extensions cannot access. 

**The key insight:** When you navigate in the PDF, Chrome updates the URL to `file:///...pdf#page=26`. This URL hash is what our extension reads.

**Best Workflow:**
```
1. Navigate in PDF → URL becomes: ...pdf#page=26
2. Click extension → Page "26" detected automatically ✓
3. Adjust name → Click Add → Bookmark saved!
```

**Or simply:** Type the page number manually - always works!

### Tips
- Each PDF file has its own separate bookmark list
- Bookmarks are named automatically based on the PDF filename
- Your bookmarks sync across Chrome instances via Chrome Sync Storage
- Page numbers start from 1 (not 0)

## 🔧 Technical Details

- **Manifest Version:** 3 (latest Chrome extension standard)
- **Storage:** Chrome Sync Storage (bookmarks sync across devices)
- **Page Detection:** 
  - Primary method: Parse URL hash (`#page=N`)
  - Chrome's PDFium-based PDF viewer runs in an isolated embedded frame
  - Direct DOM access is impossible due to security isolation
  - Fallback attempts to use PDFViewerApplication API (rarely available)
- **File Identification:** Uses base64-encoded URL hash for unique PDF identification
- **Permissions:** `storage`, `scripting`, `activeTab`, and host permissions for PDF files

### Technical Background: Why URL Hash Method?

**Chrome's PDF Viewer Architecture:**
- Chrome uses PDFium (not PDF.js like Firefox)
- The PDF viewer runs as an embedded `APPLICATION/PDF` in an isolated security context
- The toolbar and page controls are NOT accessible from JavaScript in the HTML wrapper
- This is fundamentally different from Firefox's PDF.js which runs in the same DOM context

**According to Chromium documentation and Stack Overflow consensus:**
> "Chromium based PDF Reader is isolated from the HTML carrier. The toolbars of Acrobat powered Edge or PDFium powered Chrome, are not generally accessible outside their embedded frames."

**Our Solution:**
1. User navigates to a page in the PDF (using viewer controls, keyboard, etc.)
2. Chrome updates the URL to include `#page=N`
3. Extension reads the page number from the URL
4. For jumps, extension updates URL with new page number and reloads the page

This is the **standard and recommended approach** for Chrome PDF extensions.

### Alternative: Manual Entry
Since automated detection has inherent limitations, the extension always allows manual page number entry, which works 100% of the time.

## 🎯 Improvements from Version 1.0

### ✅ Resolved Issues
- ✅ **Page Detection** - Now reliably detects current page from Chrome's PDF viewer
- ✅ **PDF-Specific Bookmarks** - Bookmarks are matched to individual PDF files
- ✅ **Multiple Bookmarks** - Support for unlimited bookmarks per PDF
- ✅ **Modern UI** - Professional, user-friendly interface
- ✅ **Manifest V3** - Updated to the latest Chrome extension standard

### 🆕 New Features
- Named bookmarks with custom descriptions
- Automatic page detection from PDF viewer
- Visual feedback and error handling
- Sorted bookmark list by page number
- One-click navigation to bookmarks
- Import/Export capabilities (ready for future enhancement)

## 🛠️ Development

This extension uses:
- Vanilla JavaScript (no frameworks)
- Chrome Extensions Manifest V3
- Chrome Storage API
- Chrome Tabs API
- Content Scripts for PDF interaction

## 📝 Future Enhancements

Potential features for future versions:
- Import/Export bookmarks to JSON
- Bookmark categories and tags
- Search within bookmarks
- Keyboard shortcuts for quick bookmark creation
- Thumbnail previews for bookmarks
- Cloud backup options

## 📄 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

