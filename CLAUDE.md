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

### Testing the Extension
- Load unpacked extension from `public/` directory in Chrome (`chrome://extensions/`)
- Enable developer mode
- Refer to `TESTING_GUIDE.md` for comprehensive testing procedures

## Architecture Overview

### Chrome Extension Structure
- **`public/manifest.json`**: Extension manifest (Manifest V3)
- **`public/content.js`**: Content script for element selection and DOM manipulation
- **`public/background.js`**: Service worker for extension communication and tab management
- **`public/sidepanel.js`**: Main UI logic with three integrated features
- **`public/sidepanel.html/css`**: Side panel interface

### Core Components

**Content Script (`content.js`)**:
- Handles element selection mode with visual highlighting
- Extracts HTML structure, computed styles, and element data
- Creates interactive overlays and tooltips
- Communicates with background script via message passing

**Background Script (`background.js`)**:
- Manages extension state and inter-script communication
- Handles tab capture and content script injection
- Provides API for getCurrentPageData, selection mode control

**Side Panel (`sidepanel.js`)**:
- Three-tab interface: Prompt Generation, Data Extraction, PRD Generation  
- Generates natural language prompts from selected elements
- Provides comprehensive page analysis and data export
- Integrates with optional backend for PRD generation

### Key Technical Features

**Element Selection System**:
- Visual highlighting with hover effects and selection overlays
- Recursive element analysis including child elements
- Smart style extraction using `getComputedStyle`
- Intelligent CSS property categorization (layout, colors, fonts, etc.)

**Prompt Generation Algorithm**:
- Uses OpenRouter API with GPT-4o-mini for intelligent prompt generation
- Converts technical element data to natural language instructions  
- Structured output format optimized for AI coding assistants
- Includes HTML structure, CSS styling, and technical requirements
- Built-in smart prompt template that analyzes element properties comprehensively

## Development Workflow

### Testing the Extension
1. Load unpacked extension from `public/` directory in Chrome
2. Use `chrome://extensions/` developer mode
3. Refer to `TESTING_GUIDE.md` for comprehensive testing procedures

### Extension Development
- Modify files in `public/` directory
- Refresh extension in Chrome after changes
- Use Chrome DevTools for debugging content scripts
- Check extension DevTools for background script logs

### Build System
- Uses Vite (TypeScript config) for build optimization
- Entry point: `public/sidepanel.html`
- Build outputs to `dist/` directory
- Files in `public/` directory are copied directly to output

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

## Important Notes

- Extension requires Chrome 88+ for side panel support
- All URLs require explicit host permissions in manifest
- Content script runs on all URLs (`<all_urls>`)
- Backend integration is optional (only for PRD generation)
- Built-in support for both Chinese and English interfaces

## File Structure

```
public/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for extension communication
├── content.js            # Content script for element selection/DOM manipulation
├── sidepanel.html        # Main UI interface
├── sidepanel.css        # UI styling
├── sidepanel.js         # Main logic with three integrated features
└── image.png           # Extension icon

backend/                  # Optional Python FastAPI backend
├── main.py              # FastAPI application
├── start.py            # Server startup script
├── requirements.txt    # Python dependencies
└── ...                 # Additional backend files
```

## Extension Permissions

The extension requires these permissions (defined in manifest.json):
- `activeTab`, `sidePanel`, `storage`, `scripting`, `tabs`, `clipboardWrite`
- Host permissions for localhost and specific domains for API access
- Content script runs on `<all_urls>` for universal element selection

## API Configuration

The extension uses OpenRouter API for intelligent prompt generation:
- API key configured in `sidepanel.js` (search for "openrouter.ai")
- Uses GPT-4o-mini model for optimal cost/performance balance
- No backend dependency for core prompt generation functionality
- Fallback error handling for network issues