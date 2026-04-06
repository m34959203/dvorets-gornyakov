# API Specification

All API endpoints are under `/api/`. Responses use format `{ data: ... }` on success and `{ error: "message" }` on failure.

## Authentication

### POST /api/auth/login
Login with email and password. Sets httpOnly cookie.
- Body: `{ email: string, password: string }`
- Response: `{ data: { user: { id, email, role, name } } }`

### GET /api/auth/me
Get current authenticated user.
- Response: `{ data: { user: { userId, email, role, name } } }`

## News

### GET /api/news
List news articles.
- Query: `page`, `limit`, `status`, `category`
- Response: `{ data: NewsArticle[] }`

### POST /api/news (auth required)
Create news article.
- Body: `{ title_kk, title_ru, content_kk, content_ru, excerpt_kk?, excerpt_ru?, image_url?, category?, status? }`

## Clubs

### GET /api/clubs
List clubs.
- Query: `direction`, `active`
- Response: `{ data: Club[] }`

### POST /api/clubs (auth required)
Create club.

### POST /api/clubs/enroll
Submit enrollment form (public, rate limited to 3/hour/IP).
- Body: `{ club_id, child_name, child_age, parent_name, phone, email? }`

## Events

### GET /api/events
List events.
- Query: `type`, `month`, `year`

### POST /api/events (auth required)
Create event.

## Chatbot

### POST /api/chatbot
Send message to AI chatbot.
- Body: `{ message: string, locale?: "kk"|"ru", history?: Array<{role, text}> }`
- Response: `{ data: { reply: string } }`

## Translation

### POST /api/translate (auth required)
Translate text between KZ and RU.
- Body: `{ text: string, from: "kk"|"ru", to: "kk"|"ru" }`

## Recommendation

### POST /api/recommend
Get AI club recommendation.
- Body: `{ answers: Record<string, string>, locale?: string }`
- Response: `{ data: { recommendation: string } }`

## Banners

### GET /api/banners
List active banners.

### POST /api/banners (admin only)
Create banner.

## Social

### POST /api/social/telegram (auth required)
Post to Telegram channel.
- Body: `{ type: "news"|"event", title, excerpt?, date?, location?, url? }`

## Upload

### POST /api/upload (auth required)
Upload file (multipart/form-data).
- Body: FormData with `file` field
- Max size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF, PDF
