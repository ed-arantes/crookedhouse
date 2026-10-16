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

The Admin iCal tab supports importing separate Airbnb and Booking.com calendar
feeds. Imported dates block availability and are shown with a red Airbnb marker
or a blue Booking.com marker. This is a one-way import; it does not publish
Crooked House bookings back to either platform.

## Cloudflare Pages settings

- Build command: `npm run build`
- Build output directory: `out`
- Functions directory: `functions`
- Node.js version: 20 or newer

Set `STRIPE_SECRET_KEY` as a Pages secret and `STRIPE_PUBLISHABLE_KEY` as a
Pages variable. The custom Payment Element checkout requires both: the secret
key creates the PaymentIntent on the server, and the publishable key initializes
Stripe Elements in the browser. A previous hosted Stripe Checkout flow may have
worked with only the secret key. The Payment Element hides Link's wallet option
and does not request that card details be saved for future use. Do not configure
`setup_future_usage`. Do not commit
`.dev.vars`; `.dev.vars.example` is provided for local reference.

When rotating Stripe credentials, update the Pages Production bindings (and
Preview too if it is used) with keys from the intended Stripe account. Pages
Functions read `STRIPE_SECRET_KEY` from the Cloudflare environment; they do not
fall back to a key in the source code. Create a new Pages deployment after
changing the bindings so the deployed Functions use the updated values.

Deploy the booking-expiration Worker separately after configuring its
`STRIPE_SECRET_KEY` secret:

```text
npx wrangler deploy --config wrangler.expire-bookings.jsonc
```

The config binds it to the existing `crookedhouse-translations` D1 database and
adds the once-per-minute Cron Trigger. Review the account and D1 binding in
`wrangler.expire-bookings.jsonc` before deploying. The secret must be configured
for this Worker independently of Pages. To update the Worker secret, run
`npx wrangler secret put STRIPE_SECRET_KEY --config wrangler.expire-bookings.jsonc`
and enter the key for the intended Stripe account when prompted. Do not place
secret values in Wrangler config, source control, or chat. After verifying both
Cloudflare bindings use the intended account, revoke the old key in Stripe.

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
