# gurl-pro-next

Modern free-stack migration target for the current `gurl.pro` YOURLS installation.

Current stack:

- Next.js / React
- Vercel Git import from GitHub
- Turso/libSQL database
- Cloudflare Turnstile-ready captcha
- Simple admin auth planned

## Commands

```bash
npm install
npm run build
npm run verify
npm run db:push
npm run import:yourls -- ./exports/yourls_url.tsv.gz
```

## Required env

```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
ADMIN_USERNAME=admin
ADMIN_PASSWORD=
```

## Migration policy

Import old YOURLS links and total click counters from `yourls_url`. Do not import the old 4.6M-row click log into the live DB.
