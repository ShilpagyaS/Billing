# Raja Gems Testing Lab — Certificate Card Generator

A Next.js 14 app that generates gemstone certificates with QR codes.
When someone **scans the QR**, they are taken directly to your website where the full certificate is displayed and verified from your database.

## How It Works

```
Owner fills form → clicks Generate
  → Certificate saved to Supabase database
  → QR code encodes: https://yoursite.com/verify/RG119903
  → Owner prints the card

Customer scans QR with phone
  → Opens yoursite.com/verify/RG119903
  → Page fetches cert from Supabase
  → Shows verified certificate card
```

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (free Postgres database)
- **qrcode** — QR code generation
- **Tailwind CSS**

---

## Setup (one-time)

### Step 1: Create Supabase project (free)

1. Go to https://supabase.com → Sign up (free)
2. Click **New Project**
3. Give it a name e.g. `raja-gems`, set a password, choose region → Create

### Step 2: Create the certificates table

In Supabase → **SQL Editor** → paste and run:

```sql
create table certificates (
  id uuid default gen_random_uuid() primary key,
  certificate_no text unique not null,
  variety text,
  weight text,
  color text,
  shape_and_cut text,
  measurement text,
  specific_gravity text,
  comment text,
  gemmologist text,
  gem_image_url text,
  created_at timestamptz default now()
);

-- Allow public read (for the verify page)
alter table certificates enable row level security;

create policy "Public can read certificates"
  on certificates for select
  using (true);

create policy "Anyone can insert certificates"
  on certificates for insert
  with check (true);

create policy "Anyone can update certificates"
  on certificates for update
  using (true);
```

### Step 3: Get your API keys

In Supabase → **Project Settings** → **API**:
- Copy **Project URL** (looks like `https://abcdefgh.supabase.co`)
- Copy **anon / public** key

### Step 4: Add keys to the app

Copy the template and fill in your keys:

```bash
cp .env.local.template .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 5: Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Deploying to production (so QR works publicly)

Easiest: **Vercel** (free)

1. Push code to GitHub
2. Go to https://vercel.com → Import repo
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy → Vercel gives you a URL like `raja-gems.vercel.app`

QR codes will then point to `https://raja-gems.vercel.app/verify/RG119903` ✓

---

## Project Structure

```
src/
├── app/
│   ├── api/certificates/route.ts   ← Save & fetch certs (POST/GET)
│   ├── verify/[certNo]/
│   │   ├── page.tsx                ← Public verify page (server)
│   │   └── VerifyClient.tsx        ← Verify page UI (client)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CardGenerator.tsx           ← Main form + QR + save flow
│   ├── CertificateForm.tsx         ← Form inputs
│   └── GemCard.tsx                 ← The printable card
├── lib/
│   └── supabase.ts                 ← Supabase client
└── types/
    └── certificate.ts
```

---

© Raja Gems Testing Lab · Aashirwad Swarn Market · Nunhai Sarafa Bazar · Jabalpur (M.P.)
# Billing
