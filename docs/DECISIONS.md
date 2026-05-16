# BeautyByAmy — Design Decisions

A living record of architecture and design choices: what we built, why we built it that way,
and how it evolved over time.

---

## Current Design (as of 2026-05-08)

### Booking Flow
Service selection → Date/time → Customer info (name, phone, email) → Card entry → Confirm

No login, no account creation. Customers are identified at booking time by the info they
provide. The card on file is the commitment signal — if someone provides real payment details,
they're a real customer.

### Payment & No-Show Protection
Square handles everything:
- **Square Appointments** — creates the booking on Amy's calendar
- **Square card-on-file** — stores the tokenized card to Amy's Square dashboard so she can
  manually charge no-shows or late cancellations from tools she already uses
- **Square Web Payments SDK** — runs in the browser for PCI compliance; card details never
  touch our server

### Customer Identity
We upsert a local `customers` row (and a Square customer profile) when a booking is submitted.
Phone number is the primary identifier (matched in Square). The local record exists solely to
support waiver tracking — it is not an account or login identity.

### Waiver System
- Services are flagged `requiresWaiver` in `services-data.ts`
- At booking time, if the customer has no valid unexpired waiver we create a single-use
  `waiverTokens` row and set `requiresWaiver = true` on the booking
- A Vercel cron job runs daily at 10 AM, finds bookings within 3 days that still need a waiver,
  and sends an SMS reminder with the token link
- When the customer signs, `waiverReceivedAt` is stamped and an `expiresAt` is set on the
  `waivers` row based on the service type (lash: 1 year, PMU: 2 years)
- Next time the same customer books, if their waiver is still valid they skip the sign step

### Database Schema (Neon + Drizzle ORM)
| Table | Purpose |
|---|---|
| `customers` | Customer profile — created at first booking, updated on repeat bookings |
| `bookings` | One row per appointment; tracks waiver status and Square booking ID |
| `waiver_tokens` | Single-use links sent via SMS; expire at appointment time |
| `waivers` | Signed consent records; include `expiresAt` for validity window |

### SMS (Twilio)
Used for waiver reminders and future marketing. Not used for authentication.
A2P 10DLC registration is required for production delivery.

### Environment
- `.env` for all secrets (not `.env.local` — no distinction needed for a solo project)
- `NEXT_PUBLIC_` prefix only for variables that must reach the browser (Square Application ID,
  Square Location ID)
- Vercel's Neon integration injects `DATABASE_URL` automatically in production

---

## Decision History

### 2026-05-05 — Initial customer identity and waiver system

**What:** Implemented full OTP phone verification as part of booking. Flow was:
card entry → OTP send → OTP verify (creates session) → POST /api/bookings.
Used `iron-session` for encrypted cookie sessions, `otp_tokens` DB table, Twilio for
SMS delivery.

**Why:** Standard practice for booking platforms to verify phone numbers before storing
payment details. Wanted to tie the card to a verified identity.

---

### 2026-05-05 — `waiverReceived: boolean` replaced with `waiverReceivedAt: timestamp`

**What:** The original schema used `waiverReceived: boolean` and `waiverSent: boolean`.
Both replaced with nullable timestamps (`waiverReceivedAt`, `waiverSentAt`).

**Why:** A timestamp is strictly more information than a boolean — you get the date for
free and `IS NOT NULL` replaces `= true`. Useful for auditing ("when exactly did this
customer sign?") and for Amy to see in any DB report.

---

### 2026-05-05 — `requiresWaiver` split into two independent columns

**What:** `requiresWaiver: boolean` originally served double duty — "service requires a
waiver" AND "waiver not yet received." Split into `requiresWaiver` (immutable, set at
booking time, never cleared) and `waiverReceivedAt` (mutable, stamped when signed).

**Why:** Clearing `requiresWaiver` on sign destroyed the historical fact that the service
required a waiver. Two independent facts should be two independent columns. Also makes
queries clearer: `requiresWaiver = true AND waiverReceivedAt IS NULL` reads exactly as
intended.

---

### 2026-05-05 — Per-service waiver validity windows

**What:** Added `waiverValidityDays` to each service in `services-data.ts` and
`expiresAt` to the `waivers` table. Lash services: 365 days. PMU services: 730 days.
`expiresAt` is stamped at sign time using the booked service's validity window.

**Why:** A waiver for a lash fill and a waiver for microblading carry different risk profiles
and renewal cycles. Storing `expiresAt` on the waiver row means the booking route only asks
"does an unexpired waiver exist?" — the validity logic lives once (at sign time) rather than
being recalculated everywhere.

---

### 2026-05-06 — Referrer-Policy header added to /waiver

**What:** Added `Referrer-Policy: strict-origin` to the `/waiver` route via `next.config.ts`.

**Why:** The waiver page URL contains a single-use token as a query parameter
(`/waiver?token=uuid`). Without a Referrer-Policy, that token could leak in the `Referer`
header if the page links to any external resource. `strict-origin` sends only the origin,
not the path or query string, to cross-origin destinations.

---

### 2026-05-08 — OTP verification removed

**What:** Removed the entire OTP phone verification flow. Deleted `/api/auth/otp/send`,
`/api/auth/otp/verify`, `iron-session`, `SESSION_SECRET`, and the `otp_tokens` table.
The booking route now accepts `name`, `phone`, `email` directly in the request body and
upserts the customer itself.

**Why:** OTP was solving a problem this app doesn't have. There are no user accounts,
no login, and the card on file IS the verification — anyone providing real payment details
is a real, committed customer. OTP added friction (two-step modal), a Twilio A2P 10DLC
registration requirement, a monthly cost, and more failure points, with no meaningful
security benefit for a booking-only flow. Removing it makes the booking path one step
shorter and eliminates an entire dependency.

**What stayed:** Twilio remains for waiver reminder SMS and future marketing/appointment
reminder use cases.

---

### 2026-05-08 — `.env.local` replaced with `.env`

**What:** Renamed `apps/web/.env.local` to `apps/web/.env`.

**Why:** `.env.local` is a Next.js convention designed for teams that commit a shared `.env`
file with safe defaults and use `.env.local` for personal overrides. Since this is a solo
project and nothing is committed to `.env*` anyway (both are gitignored), `.env.local` added
no value. Using plain `.env` means every tool (Next.js, drizzle-kit, scripts) reads it
natively without wrappers.

---

### Stripe removed (pre-session)

**What:** Stripe was originally wired up as the payment processor. It was removed in favour
of Square handling everything.

**Why:** Amy already uses Square POS for her business. Square Appointments handles the
calendar, Square handles card-on-file storage, and Square Web Payments SDK handles PCI-
compliant card tokenisation. Using Stripe would have meant running two payment systems in
parallel — Square for booking, Stripe for the card hold — which doubled the integration
surface for no added benefit. Square's card-on-file is sufficient for no-show protection
since Amy can charge from her existing Square dashboard.
