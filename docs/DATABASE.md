# Database Schema

PostgreSQL 16. Schema defined in `sql/001_init.sql`.

## Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| email | VARCHAR(255) UNIQUE | Login email |
| password_hash | VARCHAR(255) | Argon2 hash |
| role | VARCHAR(20) | admin or editor |
| name | VARCHAR(255) | Display name |
| created_at | TIMESTAMPTZ | Creation date |

### news
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| slug | VARCHAR(255) UNIQUE | URL slug |
| title_kk/title_ru | VARCHAR(500) | Bilingual title |
| content_kk/content_ru | TEXT | Bilingual content |
| excerpt_kk/excerpt_ru | VARCHAR(1000) | Bilingual excerpt |
| image_url | VARCHAR(1000) | Cover image |
| category | VARCHAR(100) | Category tag |
| author_id | UUID (FK users) | Author |
| status | VARCHAR(20) | draft/published/archived |
| published_at | TIMESTAMPTZ | Publication date |

### clubs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name_kk/name_ru | VARCHAR(255) | Bilingual name |
| description_kk/description_ru | TEXT | Bilingual description |
| image_url | VARCHAR(1000) | Club image |
| age_group | VARCHAR(50) | Target age range |
| direction | VARCHAR(100) | Category (vocal, dance, art, etc.) |
| instructor_name | VARCHAR(255) | Instructor name |
| schedule | JSONB | Array of {day, time} objects |
| is_active | BOOLEAN | Active status |

### enrollments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| club_id | UUID (FK clubs) | Target club |
| child_name | VARCHAR(255) | Child's full name |
| child_age | INTEGER | Child's age |
| parent_name | VARCHAR(255) | Parent's full name |
| phone | VARCHAR(20) | Contact phone |
| email | VARCHAR(255) | Optional email |
| status | VARCHAR(20) | pending/approved/rejected |
| ip_address | VARCHAR(45) | For rate limiting |

### events
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| title_kk/title_ru | VARCHAR(500) | Bilingual title |
| description_kk/description_ru | TEXT | Bilingual description |
| event_type | VARCHAR(50) | concert/exhibition/workshop/etc |
| start_date | TIMESTAMPTZ | Start date/time |
| end_date | TIMESTAMPTZ | End date/time |
| location | VARCHAR(255) | Venue |
| status | VARCHAR(20) | upcoming/ongoing/completed/cancelled |

### Other Tables
- **event_subscriptions** - Email notifications for events
- **banners** - Hero banner images
- **pages** - Static content pages
- **chatbot_knowledge** - FAQ knowledge base
- **site_settings** - Key-value settings
- **media** - Uploaded files registry
