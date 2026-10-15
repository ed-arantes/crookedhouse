# Crooked House — Cloudflare Pages

This copy is a static Next.js export for Cloudflare Pages. The public pages are served as static files. Stripe payments use the Payment Element and these Pages Functions:

- `POST /api/checkout` creates a PaymentIntent and a pending booking.
- `POST /api/checkout-expire` cancels an expired or user-cancelled PaymentIntent.
- `GET /api/checkout-session?payment_intent_id=...` verifies new PaymentIntent payments. The endpoint still verifies existing Checkout Sessions with `session_id`.

The payment form starts a 15-minute deadline when the pending booking is created.
The countdown prevents submission after the deadline and the expiry endpoint
cancels the PaymentIntent. A separate scheduled Worker is the fallback when a
guest closes the page; it checks once a minute and marks cancelled bookings in
Admin. If Stripe reports that payment succeeded during an expiry race, the
booking is recorded as paid instead.

## Cloudflare Pages settings

- Build command: `npm run build`
- Build output directory: `out`
- Functions directory: `functions`
- Node.js version: 20 or newer

Set `STRIPE_SECRET_KEY` as a Pages secret and `STRIPE_PUBLISHABLE_KEY` as a
Pages variable. The publishable key is returned by the checkout API only to
initialize Stripe Elements. Do not configure `setup_future_usage`; the Payment
Element keeps Link available according to the Stripe account's payment-method
settings without requesting that cards be saved for future use. Do not commit
`.dev.vars`; `.dev.vars.example` is provided for local reference.

Deploy the booking-expiration Worker separately after configuring its
`STRIPE_SECRET_KEY` secret:

```text
npx wrangler deploy --config wrangler.expire-bookings.jsonc
```

The config binds it to the existing `crookedhouse-translations` D1 database and
adds the once-per-minute Cron Trigger. Review the account and D1 binding in
`wrangler.expire-bookings.jsonc` before deploying. The secret must be configured
for this Worker as well as for Pages; do not place secret values in Wrangler
config or source control.

For a safe payment test, use Stripe test-mode keys and an isolated test D1
database. For example, Stripe's `4242 4242 4242 4242` test card can be used with
a future expiry date and any valid CVC. Do not test against live keys. The
`dev:cloudflare` command below uses remote production D1/R2 bindings, so do not
use it for test bookings or payment-expiry tests.

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
