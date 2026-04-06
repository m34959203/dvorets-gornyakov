# Architecture

## Overview

The application is a Next.js 15 monolith using the App Router with TypeScript, Tailwind CSS, and PostgreSQL.

## Directory Structure

```
src/
  app/
    [locale]/(public)/    # Public-facing pages (SSR/SSG)
    [locale]/(admin)/     # Admin panel (client-side)
    api/                  # REST API endpoints
  components/
    ui/                   # Generic reusable components
    layout/               # Header, Footer, Sidebar
    features/             # Feature-specific components
  lib/                    # Core utilities
  messages/               # i18n translation files
  middleware.ts           # Locale redirect + auth
```

## Key Design Decisions

### Internationalization
- URL-based: `/kk/page` and `/ru/page`
- Middleware handles redirects from bare paths to default locale
- UI strings in JSON files, DB content in paired `_kk`/`_ru` columns

### Database
- Raw SQL with `pg` pool -- no ORM overhead
- UUID primary keys for security
- JSONB for flexible schedule data
- Parameterized queries for SQL injection prevention

### Authentication
- JWT tokens stored in httpOnly cookies
- Argon2 password hashing
- RBAC with admin and editor roles
- Server-side auth checks via `getCurrentUser()`

### AI Integration
- Google Gemini 2.0 Flash (free tier)
- Chatbot with conversation history and knowledge base context
- Club recommendation via structured quiz + AI matching
- Auto-translation between Kazakh and Russian

### Component Architecture
- Server Components by default for SEO and performance
- Client Components (`"use client"`) for interactive elements
- Demo data fallbacks when database is unavailable
```
