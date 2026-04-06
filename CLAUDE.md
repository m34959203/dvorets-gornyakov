# Dvorets Gornyakov - Developer Guide

## Project Overview
KGKP "Dvorets Gornyakov im. Sh. Dildebaeva" website - a bilingual (KZ/RU) cultural palace website with AI chatbot, club recommendations, event calendar, online enrollment, and admin CMS.

## Tech Stack
- Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- PostgreSQL 16 (raw SQL via `pg`, no ORM)
- Auth: JWT (jose) + Argon2 + RBAC (admin/editor)
- AI: Google Gemini API (free tier, model: gemini-2.0-flash)
- i18n: Custom implementation with /kk/ and /ru/ URL prefixes
- Deployment: Docker Compose + Caddy

## Running Locally

```bash
# Start services
docker compose up -d

# Create admin user
npx tsx scripts/create-admin.ts admin@dvorets.kz password123 "Admin"

# Seed demo data
npx tsx scripts/seed.ts

# Dev mode (without Docker for app)
cp .env.example .env.local  # edit values
npm run dev
```

## Architecture
- `src/app/[locale]/(public)/` - Public pages with header/footer
- `src/app/[locale]/(admin)/admin/` - Admin panel with sidebar
- `src/app/api/` - REST API routes
- `src/components/ui/` - Reusable UI components
- `src/components/features/` - Feature-specific components
- `src/lib/` - Utilities, DB, auth, AI clients
- `sql/` - Database migrations (sequential numbering)

## Code Style
- TypeScript strict mode, no `any`
- Prefer server components; use `"use client"` only when needed
- Tailwind CSS for styling (no CSS modules)
- All UI text in `src/messages/*.json`, DB content in `_kk`/`_ru` fields
- Functions/variables: camelCase; components: PascalCase; DB fields: snake_case

## Database
- Raw SQL via `pg` pool - no ORM
- Migrations in `sql/` folder with sequential numbering (001_, 002_, etc.)
- All bilingual content fields: `field_kk`, `field_ru`
- UUIDs for primary keys
- JSONB for schedule data

## API Conventions
- REST endpoints in `src/app/api/`
- Consistent response format: `{ data: ... }` or `{ error: "message" }`
- Input validation with Zod schemas
- Auth via JWT in httpOnly cookie
- Rate limiting on enrollment endpoint (3/hour/IP)

## i18n
- URL structure: `/kk/...` (Kazakh, default) and `/ru/...` (Russian)
- UI strings: `src/messages/kk.json` and `src/messages/ru.json`
- Database content: `title_kk`/`title_ru` field pairs
- Use `getLocalizedField(item, "field", locale)` helper
- Middleware redirects `/` to `/kk/`

## Security
- All user input validated with Zod
- SQL parameterized queries (never string concatenation)
- JWT in httpOnly, secure, sameSite cookies
- File upload: type and size validation
- Rate limiting on public forms
- XSS prevention: React auto-escaping + CSP headers in Caddy
- RBAC: admin and editor roles

## AI/Gemini
- Use `src/lib/gemini.ts` for all Gemini API calls
- System prompts define behavior context
- Token budget: maxOutputTokens=1024 for chatbot
- Graceful fallback when API key missing or quota exceeded
- Cache common responses where possible

## Testing
- Run `npm run lint` before committing
- Run `npm run build` to verify production build
- Test both /kk/ and /ru/ routes
- Test enrollment rate limiting
- Verify chatbot fallback without API key

## Git
- Conventional commits: feat:, fix:, docs:, refactor:, style:, test:
- Feature branches, PR required for main
- Never commit .env files
