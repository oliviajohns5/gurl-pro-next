# gurl-pro-next

Modern Vercel-ready migration target for the current `gurl.pro` YOURLS installation.

Current state: scaffold/prototype. Production domain is not switched.

## Commands

```bash
npm install
npm run build
npm run verify
```

## Required env

```bash
DATABASE_URL=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
AUTH_SECRET=
```

## Migration

- Apply `db/schema.sql` to managed Postgres.
- Export YOURLS links with `scripts/export-yourls-url.sh` on the VPS.
- Import links with `scripts/import-yourls-url.mjs`.
- Keep legacy click logs archived unless a paid DB plan is selected.
