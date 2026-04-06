# Dvorets Gornyakov Website

Bilingual (KZ/RU) website for KGKP "Dvorets Gornyakov im. Sh. Dildebaeva" -- a cultural palace in Zhezkazgan, Kazakhstan.

## Features
- Bilingual interface (Kazakh / Russian) with URL-based locale switching
- AI-powered chatbot with voice input (Google Gemini API)
- Smart club recommendation quiz with AI matching
- Interactive event calendar with filters and subscriptions
- Online club enrollment with rate limiting
- Admin panel with full CMS (news, clubs, events, banners, users)
- Auto-translation of content via Gemini API
- Auto-posting to Telegram channel
- Responsive design with Kazakh national elements

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd dvorets-gornyakov
npm install

# Configure environment
cp .env.example .env.local

# Start with Docker
docker compose up -d

# Or run in dev mode (requires PostgreSQL)
npm run dev
```

## Documentation
- [Architecture](./ARCHITECTURE.md)
- [API Specification](./API.md)
- [Database Schema](./DATABASE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
