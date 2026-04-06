# Contributing Guidelines

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure
4. Start PostgreSQL: `docker compose up postgres -d`
5. Initialize DB: `psql -f sql/001_init.sql`
6. Run dev server: `npm run dev`

## Code Standards

- TypeScript strict mode, no `any` types
- Use server components by default
- Add `"use client"` only for interactive components
- All UI text must go in `src/messages/kk.json` and `src/messages/ru.json`
- Database content uses `_kk`/`_ru` field pairs
- Use Tailwind CSS for styling

## Git Workflow

1. Create feature branch from `main`: `git checkout -b feat/feature-name`
2. Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
3. Run lint before committing: `npm run lint`
4. Verify build: `npm run build`
5. Create pull request to `main`

## Adding New Features

### New Page
1. Create page in `src/app/[locale]/(public)/your-page/page.tsx`
2. Add translations to both `kk.json` and `ru.json`
3. Add navigation link in `Header.tsx`

### New API Endpoint
1. Create route in `src/app/api/your-endpoint/route.ts`
2. Add Zod validation schema in `src/lib/validators.ts`
3. Document in `docs/API.md`

### Database Migration
1. Create new file: `sql/002_your_migration.sql`
2. Update `docs/DATABASE.md`
3. Test migration on dev database first
