# Connektly Lead Backend

Express API for Connektly website lead capture, email notifications, persistent lead storage, and protected admin lead APIs.

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
```

Use either `DATABASE_URL` for PostgreSQL or `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` for Supabase REST storage. The service role key must only exist on the backend.

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

Point the DNS CNAME for `api` to the Render-provided hostname.

## Frontend URLs

Website forms submit to:

```text
https://backend.connektly.in/api/leads
```

The admin panel is available at:

```text
https://www.connektly.in/admin
```

For local development, change the one `API_BASE_URL` constant in `components/lead-forms.js` or `admin/index.html` from `https://backend.connektly.in` to `http://localhost:5000`.
