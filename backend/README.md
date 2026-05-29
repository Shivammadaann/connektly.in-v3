# Connektly Backend

Express API for Connektly website lead capture, email notifications, persistent lead storage, protected admin lead APIs, and the Help Centre CMS/API.

## Local setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set local values in `.env`. Do not commit `.env`.

## Health check

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{ "status": "ok" }
```

## Test lead submission

```bash
curl -X POST http://localhost:5000/api/leads ^
  -H "Content-Type: application/json" ^
  -d "{\"formType\":\"book_demo\",\"name\":\"Test Lead\",\"email\":\"test@example.com\",\"sourcePage\":\"/book-demo/\"}"
```

## Required environment variables

Add these in Render:

```env
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://connektly.in,https://www.connektly.in
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
LEAD_RECEIVER_EMAIL=admin@connektly.in
ADMIN_EMAIL=admin@connektly.in
ADMIN_PASSWORD=
ADMIN_JWT_SECRET=
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=help-centre-assets
```

Use either `DATABASE_URL` for PostgreSQL or `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` for Supabase REST storage. The service role key must only exist on the backend.

Help Centre content uses `DATABASE_URL` for Supabase/PostgreSQL storage. Help Centre media uploads use `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.

## Database

The backend automatically creates the table when `DATABASE_URL` is used.

For Supabase, create this table in SQL editor:

```sql
create extension if not exists pgcrypto;

create table if not exists website_leads (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  source_page text,
  page_url text,
  name text,
  email text,
  phone text,
  company_name text,
  website text,
  message text,
  selected_plan text,
  business_type text,
  partner_type text,
  customer_volume text,
  client_network text,
  preferred_demo_time text,
  consent boolean default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  fbclid text,
  msclkid text,
  first_page_url text,
  landing_page text,
  referrer text,
  captured_at text,
  user_agent text,
  submitted_at timestamptz,
  ip_address text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_leads_created_at_idx on website_leads (created_at desc);
create index if not exists website_leads_status_idx on website_leads (status);
create index if not exists website_leads_form_type_idx on website_leads (form_type);
```

## Help Centre

Public Help Centre URLs:

```text
https://www.connektly.in/help
https://www.connektly.in/help/collection.html?slug=collection-slug
https://www.connektly.in/help/article.html?slug=article-slug
```

The frontend uses:

```js
const API_BASE_URL = "https://backend.connektly.in";
```

Public Help APIs:

```text
GET /api/help/collections
GET /api/help/collections/:slug
GET /api/help/articles/:slug
GET /api/help/search?q=query
POST /api/help/articles/:slug/feedback
```

Protected Help CMS APIs:

```text
GET /api/admin/help/stats
GET /api/admin/help/collections
POST /api/admin/help/collections
GET /api/admin/help/collections/:id
PATCH /api/admin/help/collections/:id
DELETE /api/admin/help/collections/:id
GET /api/admin/help/groups
POST /api/admin/help/groups
GET /api/admin/help/groups/:id
PATCH /api/admin/help/groups/:id
DELETE /api/admin/help/groups/:id
GET /api/admin/help/articles
POST /api/admin/help/articles
GET /api/admin/help/articles/:id
PATCH /api/admin/help/articles/:id
DELETE /api/admin/help/articles/:id
POST /api/admin/help/articles/:id/publish
POST /api/admin/help/articles/:id/unpublish
POST /api/admin/help/articles/:id/duplicate
POST /api/admin/help/media/upload
GET /api/admin/help/media
DELETE /api/admin/help/media/:id
GET /api/admin/help/feedback
```

All admin Help Centre routes require the same JWT as the lead admin routes. Public routes only return published content. Draft and archived articles do not appear publicly.

### Help Centre SQL

Run this in Supabase SQL editor if you want to create the tables manually. The backend also creates these tables automatically when `DATABASE_URL` is configured.

```sql
create extension if not exists pgcrypto;

create table if not exists help_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  icon text,
  sort_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists help_groups (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references help_collections(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  sort_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(collection_id, slug)
);

create table if not exists help_articles (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references help_collections(id) on delete set null,
  group_id uuid references help_groups(id) on delete set null,
  title text not null,
  slug text unique not null,
  summary text,
  content_html text,
  content_text text,
  toc jsonb,
  tags text[],
  featured_image_url text,
  seo_title text,
  seo_description text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer default 0,
  reading_time integer,
  author_name text,
  view_count integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists help_article_feedback (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references help_articles(id) on delete cascade,
  rating text not null check (rating in ('helpful', 'neutral', 'not_helpful')),
  message text,
  page_url text,
  referrer text,
  user_agent text,
  ip_address text,
  created_at timestamptz default now()
);

create table if not exists help_media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  mime_type text,
  file_size integer,
  alt_text text,
  created_at timestamptz default now()
);

create index if not exists help_collections_slug_idx on help_collections (slug);
create index if not exists help_groups_collection_id_idx on help_groups (collection_id);
create index if not exists help_articles_slug_idx on help_articles (slug);
create index if not exists help_articles_status_idx on help_articles (status);
create index if not exists help_articles_collection_id_idx on help_articles (collection_id);
create index if not exists help_articles_group_id_idx on help_articles (group_id);
create index if not exists help_article_feedback_article_id_idx on help_article_feedback (article_id);
```

### Supabase Storage

Create a public Supabase Storage bucket:

```text
help-centre-assets
```

Admin image uploads go through `POST /api/admin/help/media/upload`. Allowed files are `jpg`, `jpeg`, `png`, `webp`, and `gif`, up to 5 MB. The Supabase service role key stays backend-only.

### Managing Help Centre Content

Open `https://www.connektly.in/admin`, log in, and use the Help Centre navigation:

```text
Dashboard
Collections
Groups
Articles
Media
Feedback
```

Collections are main topics. Groups are sections inside collections. Articles can be saved as draft, published, unpublished, duplicated, previewed, edited in Visual Editor mode, or edited directly in HTML Code mode.

The backend sanitizes article HTML before saving. Script tags, inline JavaScript events, and `javascript:` URLs are removed. H2 and H3 headings automatically receive unique anchors and are stored as the article table of contents.

Article feedback is collected from the public article page and shown under Help Centre > Feedback.

## SMTP

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`. Lead emails are sent to `LEAD_RECEIVER_EMAIL`, which defaults to `admin@connektly.in`.

If SMTP is not configured, the API still stores leads and skips email notification.

## Admin login

Set:

```env
ADMIN_EMAIL=admin@connektly.in
ADMIN_PASSWORD=use-a-strong-password
ADMIN_JWT_SECRET=use-a-long-random-secret
```

The static admin panel at `/admin` logs in through:

```text
POST /api/admin/login
```

Protected admin routes require:

```text
Authorization: Bearer <token>
```

## Render deployment

Create a Render Web Service:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Add all required environment variables in Render. Then connect the custom domain:

```text
backend.connektly.in
```

Point the DNS CNAME for `backend` to the Render-provided hostname.

## Frontend URLs

Website forms submit to:

```text
https://backend.connektly.in/api/leads
```

The admin panel is available at:

```text
https://www.connektly.in/admin
```

For local development, change the `API_BASE_URL` constants in `components/lead-forms.js`, `help/help.js`, and `admin/index.html` from `https://backend.connektly.in` to `http://localhost:5000`.
