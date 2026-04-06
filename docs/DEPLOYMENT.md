# Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Domain name pointed to server IP
- Gemini API key (optional, for AI features)
- Telegram Bot token (optional, for auto-posting)

## Production Deployment

### 1. Clone and configure

```bash
git clone <repo-url> /opt/dvorets-gornyakov
cd /opt/dvorets-gornyakov
cp .env.example .env
```

Edit `.env` with production values:
- Set a strong `JWT_SECRET`
- Configure `GEMINI_API_KEY`
- Set `NEXT_PUBLIC_APP_URL` to your domain
- Configure Telegram credentials if needed

### 2. Update Caddyfile

Edit `caddy/Caddyfile` and replace `dvorets-gornyakov.kz` with your domain.

### 3. Build and start

```bash
docker compose up -d --build
```

### 4. Initialize database and create admin

```bash
# Database is auto-initialized from sql/001_init.sql

# Create admin user
docker compose exec app npx tsx scripts/create-admin.ts admin@your-domain.kz your-password "Admin Name"

# Seed demo data (optional)
docker compose exec app npx tsx scripts/seed.ts
```

### 5. Verify

- Visit https://your-domain.kz
- Login at https://your-domain.kz/kk/admin

## Updates

```bash
cd /opt/dvorets-gornyakov
git pull
docker compose up -d --build
```

## Backups

```bash
# Database backup
docker compose exec postgres pg_dump -U dvorets dvorets_db > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U dvorets dvorets_db
```

## Monitoring

```bash
# View logs
docker compose logs -f app
docker compose logs -f postgres

# Check health
docker compose ps
```
