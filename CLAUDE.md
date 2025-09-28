# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PRD For AI is an industrial-grade AI dialogue system built with FastAPI backend and React frontend. It integrates with Dify workflows for AI conversations and provides complete user authentication, file upload/analysis, and conversation management.

## Quick Start Commands

### Development
```bash
# Start both frontend and backend (recommended)
./start-frontend-backend.sh

# Start backend only
cd backend && python start.py

# Start frontend only  
cd Frontend && npm run dev

# Build frontend
cd Frontend && npm run build

# Lint frontend
cd Frontend && npm run lint
```

### Backend Dependencies
```bash
cd backend && pip install -r requirements.txt
```

### Frontend Dependencies
```bash
cd Frontend && npm install
```

## Architecture

### Backend (FastAPI + SQLite/MySQL)
- **Main Application**: `backend/main.py` - Core FastAPI app with all API endpoints
- **Authentication**: `backend/auth.py` - JWT-based user auth, registration, login
- **Database**: `backend/db.py` (SQLite) or `backend/db_mysql.py` (MySQL) - Database operations
- **Environment**: `backend/1.env` or `backend/.env` - Contains Dify API keys and database config

Key API endpoints:
- `/api/chat` - Streaming/blocking chat with Dify integration
- `/api/chat/stop/{task_id}` - Stop ongoing chat responses
- `/auth/*` - User authentication endpoints
- `/api/conversations` - Conversation management
- `/api/upload` - File upload for analysis

### Frontend (React + TypeScript + Vite)
- **API Layer**: `Frontend/src/lib/api.ts` - All backend communication, type definitions
- **Authentication**: `Frontend/src/lib/auth.tsx` - Auth context and protected routes
- **Components**: `Frontend/src/components/` - UI components including chat interface
- **Pages**: `Frontend/src/pages/` - Main application pages
- **UI Library**: Uses shadcn/ui components in `Frontend/src/components/ui/`

### Key Integration Points
- **Dify API**: Backend proxies requests to Dify workflow/chat endpoints
- **Stream Processing**: Real-time chat responses via Server-Sent Events (SSE)
- **File Handling**: Upload to backend, then forward to Dify for analysis
- **Authentication**: JWT tokens stored in localStorage, validated on all API calls

## Environment Configuration

### Backend Environment (`backend/1.env` or `backend/.env`)
```env
DIFY_API_BASE=http://teach.excelmaster.ai/v1
DIFY_API_KEY=your-dify-api-key
USE_MYSQL=false  # Set to true for MySQL instead of SQLite
MYSQL_HOST=localhost  # If using MySQL
MYSQL_DATABASE=database_name
MYSQL_USER=username
MYSQL_PASSWORD=password
```

### Frontend Environment (optional)
```env
VITE_API_BASE_URL=http://localhost:8001  # Development backend URL
```

## Development Workflow

### Running Tests
No specific test commands are configured. Check for test files in the project structure.

### Code Quality
- Frontend uses ESLint: `cd Frontend && npm run lint`
- TypeScript compilation: `cd Frontend && npx tsc --noEmit`

### Database Switching
The backend can use either SQLite (default) or MySQL based on the `USE_MYSQL` environment variable. Database modules are imported conditionally in `main.py:6-11`.

## Deployment

### Frontend
- Production API points to: `https://prd-for-ai.onrender.com` 
- Can deploy to Vercel, Netlify, or similar static hosting
- Build command: `npm run build` (outputs to `dist/`)

### Backend  
- FastAPI app runs on port 8001
- Can deploy to Railway, Render, AWS, or similar
- Uses Gunicorn for production (included in requirements.txt)

## File Upload & Processing
- Supported formats: PDF, DOCX, TXT, images (JPG, PNG), Excel, PowerPoint
- Files uploaded to backend `/api/upload`, then forwarded to Dify for analysis
- File size limit: 50MB
- Generated files (markdown, DOCX, PDF) stored in `backend/generated/`

## Authentication System
- JWT-based authentication with bcrypt password hashing
- Supports email or phone number login
- Protected routes using React context
- Admin functionality available for specific email: `490429443@qq.com`

## Common Development Tasks

### Adding New API Endpoints
1. Add endpoint to `backend/main.py`
2. Add corresponding function to `Frontend/src/lib/api.ts`
3. Update TypeScript types as needed

### Adding New UI Components
1. Create component in `Frontend/src/components/`
2. Follow existing patterns using shadcn/ui
3. Import and use in pages or other components

### Database Schema Changes
1. Modify database functions in `backend/db.py`
2. Consider migration strategy for existing data
3. Update TypeScript interfaces in `Frontend/src/lib/api.ts`