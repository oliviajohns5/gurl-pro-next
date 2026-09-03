# Services and access needed

Current free-stack target:

- GitHub: `oliviajohns5/gurl-pro-next`
- Vercel Hobby: Git-linked project `gurl-pro-next`
- Turso/libSQL: stores links, daily aggregates, reports, blacklists
- Cloudflare Turnstile: captcha
- Admin auth: single protected admin password/session

Required Vercel env vars:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Storage decision:

- Import old `yourls_url` rows only: slug, destination URL, title, created date, total clicks.
- Do not import old `yourls_log` click events.
- New click stats use `daily_clicks(slug, day, clicks)` and short recent click history only.
