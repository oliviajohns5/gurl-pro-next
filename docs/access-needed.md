# Services and access needed

Required:

1. GitHub: repo `oliviajohns5/gurl-pro-next`.
2. Vercel: token/project access plus GitHub integration. Env vars must be configured on project.
3. Managed Postgres: Neon or Supabase recommended. Required env: `DATABASE_URL`.
4. Captcha: Cloudflare Turnstile recommended (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) or Google reCAPTCHA keys.
5. Admin auth: choose Auth.js/NextAuth, Clerk, or simple protected admin with `AUTH_SECRET` and admin credentials.
6. Optional abuse APIs: Google Safe Browsing/VirusTotal/OpenPhish if automatic malicious URL checks are needed.
7. DNS access for `gurl.pro` only after preview verification, not now.

Storage note: links-only import is ~137,974 rows; full click event history is ~4,609,506 rows / ~788 MB on current MySQL.
