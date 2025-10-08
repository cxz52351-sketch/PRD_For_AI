# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "AI 编程提示词生成器" (AI Programming Prompt Generator) that extracts webpage elements and generates detailed AI prompts for code recreation. It's a three-in-one tool that provides:

1. **Smart Prompt Generation**: Select webpage elements to generate detailed coding instructions
2. **Page Data Extraction**: Extract comprehensive page structure and styling  
3. **PRD Generation**: Generate Product Requirements Documents

## Development Commands

### Extension Development
```bash
# Build for development
npm run build

# Build for production (extension package)
npm run build:ext

# Preview build
npm run preview
```

### Backend Development (Optional)
The project includes an optional Python FastAPI backend for PRD generation:

```bash
cd backend
pip install -r requirements.txt
python start.py
```

### Extension Testing and Debugging
- Load unpacked extension from `public/` directory in Chrome (`chrome://extensions/`)
- Enable developer mode and reload extension after code changes
- Check browser console for logs prefixed with `[Prompt Generator]`
- Use Chrome extension developer tools for debugging background scripts
- Refer to `TESTING_GUIDE.md` for comprehensive testing procedures

### Development Workflow
- Files in `public/` directory are used directly for development (no compilation needed)
- After making changes to `public/` files, reload the extension in Chrome
- Use `npm run build` for creating optimized distribution packages
- Test extension on multiple websites to ensure compatibility

## Architecture Overview

### Chrome Extension Structure (Manifest V3)
- **`public/manifest.json`**: Extension manifest defining permissions, content scripts, and service worker
- **`public/content.js`**: Content script injected into all web pages for element selection and DOM manipulation
- **`public/background.js`**: Service worker handling extension lifecycle and inter-script communication
- **`public/sidepanel.js`**: Main UI logic with three integrated features (prompt generation, data extraction, PRD)
- **`public/sidepanel.html/css`**: Side panel interface

### Build System
- Uses Vite with TypeScript configuration for development builds
- Entry point: `public/sidepanel.html` 
- Build outputs to `dist/` directory
- Files in `public/` directory are used directly for development (no compilation needed)
- `copyPublicDir: true` ensures all public files are included in builds

### Key Technical Patterns

**Element Selection System**:
- Content script creates visual overlays and highlighting for element selection
- Uses `getComputedStyle` API for accurate style extraction
- Recursive DOM traversal for complete element analysis
- Message passing between content script and side panel via background script
- ESC key handling for exiting selection mode

**Three-Feature Integration**:
- Tab-based UI switching between Prompt Generation, Data Extraction, and PRD Generation
- Shared element selection system across all three features
- Unified storage and communication patterns

**API Integration**:
- OpenRouter API integration for intelligent prompt generation
- Optional FastAPI backend integration for PRD generation (backend/main.py)
- Chrome storage API for user preferences and data persistence
- Clipboard API for copy functionality

**Chrome Extension Communication**:
- Service worker pattern (background.js) for Manifest V3 compliance
- Content script injection with `<all_urls>` permission
- Side panel API for persistent UI across browser sessions
- Message passing with type-based routing for different features

## Code Conventions

### JavaScript Style
- ES6+ syntax with modern JavaScript features
- Extensive use of async/await for Chrome API calls
- Message passing pattern for cross-context communication
- Modular function organization with clear separation of concerns

### Chrome Extension Patterns
- Manifest V3 service worker architecture  
- Content script injection and communication
- Side panel API for persistent UI
- Storage API for settings persistence
- Tab and scripting permissions for cross-page functionality

## Important Development Notes

### Extension Requirements
- Chrome 88+ required for side panel support
- Manifest V3 compliance with service worker architecture
- Content script runs on `<all_urls>` for universal element selection
- Host permissions include specific API endpoints and `<all_urls>`
- Backend integration is optional (only for PRD generation feature)

### API Configuration
- OpenRouter API integration for intelligent prompt generation
- FastAPI backend available at `prd-for-ai-chrome.onrender.com`
- Storage API used for persisting element data and user preferences
- Clipboard API integration for copy functionality
- Error handling with user-friendly messages

### Debugging and Logging
- Console logging with `[Prompt Generator]` prefix for easy identification
- Storage inspection via `chrome.storage.session.get()` in console
- Message passing visibility in background script console
- Extension reload required after code changes in `public/` directory

### File Structure Priority
```
public/                   # Main extension files (used directly in development)
├── manifest.json        # Extension configuration and permissions
├── background.js        # Service worker for extension communication  
├── content.js          # DOM manipulation and element selection
├── sidepanel.html      # Main UI interface
├── sidepanel.css      # UI styling
├── sidepanel.js       # Core application logic and API integration
└── *.svg, *.png       # Static assets

backend/                 # Optional Python FastAPI backend
├── main.py             # FastAPI application
├── start.py           # Server startup script
├── requirements.txt   # Python dependencies
├── db.py              # Database models and operations
└── generated/         # Generated PRD files

vite.config.ts          # Build configuration for distribution
TESTING_GUIDE.md        # Comprehensive testing procedures
dist/                   # Build output (generated by Vite)
```

### Key Extension Permissions
- `activeTab`: Access to current tab for element selection
- `sidePanel`: Persistent side panel UI
- `storage`: Data persistence across sessions
- `scripting`: Content script injection
- `tabs`: Tab management and communication
- `clipboardWrite`: Copy functionality