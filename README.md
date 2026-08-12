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

## Local checks

```text
npm install
npm run test
npm run lint
npx tsc --noEmit
npm run build
```
