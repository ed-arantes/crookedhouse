# Crooked House — Cloudflare Pages

This copy is a static Next.js export for Cloudflare Pages. The public pages are served as static files. Stripe uses two Pages Functions:

- `POST /api/checkout` creates a Checkout Session.
- `GET /api/checkout-session?session_id=...` verifies the payment after Stripe redirects back.

## Cloudflare Pages settings

- Build command: `npm run build`
- Build output directory: `out`
- Functions directory: `functions`
- Node.js version: 20 or newer

Set `STRIPE_SECRET_KEY` as a Pages secret. Do not commit `.dev.vars`; `.dev.vars.example` is provided for local reference.

The Pages Functions return `Cache-Control: no-store`, and this project does not use Next.js ISR, OpenNext, an R2 incremental cache, or custom long-lived asset cache headers.

## Guest personal details

Guest names, dates of birth, and the group leader's ID/passport number are
encrypted with AES-GCM before being stored in D1. The encryption key is the
existing `BOOKING_ENCRYPTION_KEY` secret and must be a stable 64-character
hexadecimal value in local `.dev.vars` and the Cloudflare Pages environment.
Do not commit the key or rotate it without first re-encrypting existing booking
data. Requests fail rather than saving guest details in plaintext if the key is
missing or invalid.

Apply the guest-details table migration to the configured D1 database before
deploying this feature:

```text
npx wrangler d1 migrations apply crookedhouse-translations --remote
```

Guests can view, update, or delete the details for their bookings. Admins can
view or delete them from the bookings panel. Deleting a booking also deletes its
guest details.

## Local checks

```text
npm install
npm run test
npm run lint
npx tsc --noEmit
npm run build
```

## Local development with Cloudflare data

Run `npm run dev:cloudflare` and open `http://localhost:3000`. Next.js serves the
site with hot reload, while Wrangler runs the Pages Functions on port `8788`.
The local frontend sends `/api` requests to that Wrangler server. The D1 and R2
bindings in `wrangler.toml` are remote, so the Functions use the configured
Cloudflare database and bucket rather than local copies.

Authenticate Wrangler with `npx wrangler login` if needed. Changes made through
the local app (including admin edits, uploads, and deletes) affect the remote
Cloudflare resources. If `out` does not exist yet, the dev command creates the
empty directory Wrangler needs. No export rebuild is needed for local UI edits.
