# Makubook

A bilingual (Finnish/English) recipe-sharing web app for Finland — built for immigrants and expats to share recipes from their home countries with Finns, and for Finns to share their own recipes back. It's the kind of cross-cultural recipe exchange that no existing Finnish recipe platform covers.

Live at [makubook.com](https://makubook.com) (English) and [makubook.fi](https://makubook.fi) (Finnish).

## Features

- **Bilingual by domain** — `makubook.com` serves the site in English, `makubook.fi` serves it in Finnish (via next-intl domain-based routing), with the language switcher redirecting between the two automatically.
- **Automatic recipe translation** — a recipe written in one language is translated on the fly (DeepL API) when viewed from the other language's domain, cached per recipe/locale in Postgres so it's a one-time cost, with a disclaimer banner and a one-click toggle back to the original text.
- **Recipe authoring** — structured ingredients, numbered step-by-step instructions, optional tips, country of origin, meal type tags, and an interactive photo cropper for the recipe image.
- **Editor moderation queue** — new recipes stay pending until an editor approves them, triggering an automatic branded email notification to the author.
- **Search** — a dedicated `/search` page with instant-apply filters (country, meal type, language, servings), state-driven via URL query params so results are shareable and linkable, with a "similar recipes" fallback when a filtered search returns nothing.
- **Comments & ratings** — 1–5 star ratings with helpful-vote counts, gated to logged-in users and enforced at both the UI and database (RLS) level.
- **Mobile-first navigation** — a fixed bottom icon bar on mobile, collapsing to just the logo and search on the desktop top bar, plus a slidable featured-recipes carousel on the homepage.
- **Auth & profiles** — email/password auth via `@supabase/ssr` with required email confirmation, and user profiles with display name, birthday, and an optional avatar.
- **Transactional email** — Resend as a verified custom SMTP provider for Supabase Auth, with a branded HTML email template shared across signup confirmation, password reset, and recipe-approval notifications.
- **Spam protection & SEO** — honeypot field + IP-based rate limiting on the public contact form, plus a dynamic `sitemap.xml` and `robots.txt`.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) — Postgres, Auth, Storage, Row-Level Security
- [next-intl](https://next-intl.dev) — domain-based i18n routing (Finnish/English)
- [DeepL API](https://www.deepl.com/pro-api) — automatic recipe translation
- [Resend](https://resend.com) — transactional email + custom SMTP
- Tailwind CSS
- Deployed on [Vercel](https://vercel.com)

## Project structure

```
web/         Next.js app (App Router)
supabase/    Database migrations
```

## Getting started

```bash
cd web
npm install
npm run dev
```

Requires a `.env.local` with Supabase, DeepL, and Resend credentials (see the environment variables referenced under `web/src/lib`).

Database schema and migrations live in `supabase/migrations` — run them against a Supabase project (Postgres) to set up the schema.

## Region & compliance

Hosted on Supabase's Stockholm region for GDPR compliance given the Finnish user base, with a full bilingual Privacy Policy and Terms of Service.
