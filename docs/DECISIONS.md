# BeautyByAmy — Design Decisions

A living record of architecture and design choices: what we built, why we built it that way,
and how it evolved over time.

**When to update this file:** Any time a meaningful architectural or design decision is made —
new integrations, approach pivots, schema changes, removal of dependencies, or deliberate
trade-offs. Add an entry to Decision History and update Current Design if the snapshot changes.

---

## Current Design (as of 2026-05-16)

### Project Structure
Single Next.js application at the repo root. No monorepo, no separate backend, no mobile app.
All source code lives under `src/`, static assets under `public/`.

### Booking Flow
```
Service selection → Date / time → Customer info (name, phone, email) → Card entry → Confirm
```
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
- Services are flagged `requiresWaiver` in `src/lib/services-data.ts`
- At booking time, if the customer has no valid unexpired waiver:
  - A `waiver_tokens` row is created (single-use, expires at appointment time)
  - `requiresWaiver = true` is set on the booking
  - **Resend emails the client** a branded confirmation with the appropriate PDF waiver attached:
    - Eyelash services → `public/waivers/lash-waiver.pdf` (fillable AcroForm)
    - PMU, first visit → `public/waivers/pmu-consent.pdf`
    - PMU, returning client → `public/waivers/pmu-reconsent.pdf`
  - `waiverSentAt` is stamped on the booking row
- Client fills out the PDF, signs it, and emails it back to `BeautyByAmyLe@gmail.com`
- A Vercel cron job runs daily at 10 AM UTC, finds bookings within 3 days that still need a
  waiver, and sends an SMS reminder (Twilio) with the token link to the HTML waiver form as
  a secondary channel
- When the customer signs the HTML form, `waiverReceivedAt` is stamped and `expiresAt` is set
  based on service type (lash: 365 days, PMU: 730 days)
- Returning customers with a valid unexpired waiver skip the sign step entirely

### Admin Panel
Password-protected at `/admin` via Google OAuth (NextAuth v5). Amy can:
- Manage the service catalog
- Upload and reorder gallery images
- Update site-wide images (hero, meet-amy)
- Set/clear the announcement banner
- View the signed waiver log

### Database Schema (Neon + Drizzle ORM)

| Table | Purpose |
|---|---|
| `customers` | Customer profile — created at first booking, updated on repeat bookings |
| `bookings` | One row per appointment; tracks waiver status, Square booking ID, timestamps |
| `waiver_tokens` | Single-use token links; expire at appointment start time |
| `waivers` | Signed consent records with `waiverType`, `formData`, and `expiresAt` |
| `services` | CMS-managed service catalog (name, price, duration, category) |
| `gallery_images` | Cloudinary image metadata for the public photo gallery |
| `site_images` | Cloudinary image metadata for site-wide images (hero, meet-amy, etc.) |
| `announcements` | Sitewide banner messages (active/inactive) |

### Image Storage (Cloudinary)
Gallery images and site images are stored in Cloudinary. The DB holds metadata (public ID,
URL, display order). Upload and delete operations go through `src/lib/cloudinary.ts`.

### Email (Resend)
Transactional email only. Currently used for one purpose: waiver PDF delivery on booking.
Sending domain: `appointments@beautybyamy.com` (must be verified in Resend dashboard before
production launch). Logic lives in `src/lib/email.ts`.

### SMS (Twilio)
Used for waiver reminder SMS (cron-triggered). Not used for authentication.
A2P 10DLC registration is required for production SMS delivery.

### Environment
- `.env` for all secrets (not `.env.local` — no distinction needed for a solo project)
- `NEXT_PUBLIC_` prefix only for variables that must reach the browser (Square Application ID,
  Square Location ID)
- Vercel's Neon integration injects `DATABASE_URL` automatically in production

---

## Decision History

### 2026-05-17 — Before/after carousel on gallery cards

**What:** Each gallery card is now a 2-item carousel when a "before" image is uploaded. The card
defaults to the After image and shows chevron arrows + dot indicators on hover for switching.
Clicking a card opens a fullscreen modal where the same carousel plays with keyboard navigation
(← → for before/after, Esc to close). Cards with no before image behave as static photos.

Three nullable columns were added to `gallery_images`: `before_cloudinary_id`, `before_url`,
`before_blur_data_url`. The admin gallery uploader accepts an optional Before file at upload
time; existing cards get an "Add before" button in the admin grid.

**Why:** Amy's portfolio is almost entirely transformation photos. Storing both images on the same
DB row keeps each card a single entity — no joins, no separate "pairs" concept. Making the before
optional means the feature degrades gracefully for single images.

---

### 2026-05-17 — Gallery section removed from landing page

**What:** The portfolio/gallery section was removed from the home page entirely. Gallery images
now appear only on the dedicated `/gallery` route, powered by `GalleryClient` (a client
component). `gallery-section.tsx` remains in the codebase but is no longer imported anywhere.

**Why:** The admin "Gallery" panel manages images shown on the `/gallery` page. Having those
images also appear as a preview section on the landing page created confusion: the "portfolio"
landing section and the `/gallery` page were conceptually the same thing rendered twice.
Removing the landing preview simplifies the data flow (home page only needs the 5 site-image
slots) and lets the gallery page stand on its own.

---

### 2026-05-17 — Announcement scheduling (`scheduled_for` column)

**What:** Added a nullable `scheduled_for: timestamp` column to the `announcements` table.
The admin UI shows a datetime-local picker when creating an announcement. If set, the banner
is shown only after that timestamp passes. The admin list shows Scheduled / Live / Inactive
badges. The public banner API respects `scheduled_for` when filtering active announcements.

**Why:** Amy sometimes wants to draft and save an announcement ahead of time (e.g., holiday
hours a week before the holiday). A single nullable column on the existing table was the
simplest approach — no separate "draft" state or status enum needed.

---

### 2026-05-16 — Monorepo flattened; Flutter app removed

**What:** Moved all of `apps/web/` to the repo root. Deleted `mobile_flutter/`, `turbo.json`,
and the root workspace `package.json`. The repo now has a single `package.json` at the root
and no workspace tooling.

**Why:** The Turbo monorepo was set up to accommodate both a Next.js web app and a Flutter
mobile app. The Flutter app was a university course project and is no longer active. With only
one application, the `apps/web/` nesting added no value — it complicated every path reference,
every `cd` command, and every tool invocation for zero benefit.

---

### 2026-05-14 — Waiver delivery approach: HTML wizard → PDF email attachment

**What:** Replaced the planned approach of directing customers to a custom HTML waiver wizard
at `/waiver?token=…` with a simpler PDF-email flow. On booking, Resend attaches the
appropriate blank PDF waiver (lash, PMU consent, or PMU re-consent) to the confirmation email.
The client fills it out, signs it, and replies with the completed PDF. The HTML waiver page
(`/waiver`) is kept as a secondary channel for SMS reminders.

**Why:** The HTML wizard produced signed data that only existed in our database — Amy had no
readable output she could actually review or store. A signed PDF lives in email, is printable,
is legally conventional for beauty service waivers, and requires no custom admin viewer. The
PDF approach is also what physical salons already do, so clients understand the expectation.
The trade-off is that waiver receipt is tracked by Amy manually (checking her inbox) rather
than automatically stamping `waiverReceivedAt` — acceptable for the current scale.

---

### 2026-05-12 — Admin CMS: Supabase replaced with Neon + Drizzle + Cloudinary

**What:** Removed Supabase entirely (uninstalled `@supabase/supabase-js`, deleted
`src/lib/supabase.ts`). Admin image storage moved to Cloudinary. All DB operations now go
through Drizzle ORM against the existing Neon database. Added five new tables: `services`,
`gallery_images`, `site_images`, `announcements`, and expanded `waivers`.

**Why:** Supabase was being used only for Storage (image hosting) and a handful of DB queries.
Using two separate database systems (Supabase + Neon) for the same app created split concerns
with no benefit. Consolidating onto Neon + Drizzle gives one schema file, one migration tool,
and one connection to reason about. Cloudinary was chosen for images because it has a generous
free tier, built-in CDN, and is purpose-built for media delivery.

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

**What stayed:** Twilio remains for waiver reminder SMS and future appointment reminders.

---

### 2026-05-08 — `.env.local` replaced with `.env`

**What:** Renamed `.env.local` to `.env` (path was `apps/web/.env.local` at the time,
now just `.env` at the repo root after the monorepo flatten).

**Why:** `.env.local` is a Next.js convention for teams that commit a shared `.env` with safe
defaults and use `.env.local` for personal overrides. Since this is a solo project and nothing
is committed to `.env*` anyway (both are gitignored), `.env.local` added no value. Plain `.env`
is read natively by Next.js, drizzle-kit, and all Node scripts without wrappers.

---

### 2026-05-06 — Referrer-Policy header added to /waiver

**What:** Added `Referrer-Policy: strict-origin` to the `/waiver` route via `next.config.ts`.

**Why:** The waiver page URL contains a single-use token as a query parameter
(`/waiver?token=uuid`). Without a Referrer-Policy, that token could leak in the `Referer`
header if the page links to any external resource. `strict-origin` sends only the origin,
not the path or query string, to cross-origin destinations.

---

### 2026-05-05 — Per-service waiver validity windows

**What:** Added `waiverValidityDays` to each service in `src/lib/services-data.ts` and
`expiresAt` to the `waivers` table. Lash services: 365 days. PMU services: 730 days.
`expiresAt` is stamped at sign time using the booked service's validity window.

**Why:** A waiver for a lash fill and a waiver for microblading carry different risk profiles
and renewal cycles. Storing `expiresAt` on the waiver row means the booking route only asks
"does an unexpired waiver exist?" — the validity logic lives once (at sign time) rather than
being recalculated everywhere.

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

### 2026-05-05 — `waiverReceived: boolean` replaced with `waiverReceivedAt: timestamp`

**What:** The original schema used `waiverReceived: boolean` and `waiverSent: boolean`.
Both replaced with nullable timestamps (`waiverReceivedAt`, `waiverSentAt`).

**Why:** A timestamp is strictly more information than a boolean — you get the date for
free and `IS NOT NULL` replaces `= true`. Useful for auditing ("when exactly did this
customer sign?") and for Amy to see in any DB report.

---

### 2026-05-05 — Initial customer identity and waiver system

**What:** Implemented full OTP phone verification as part of booking. Flow was:
card entry → OTP send → OTP verify (creates session) → POST /api/bookings.
Used `iron-session` for encrypted cookie sessions, `otp_tokens` DB table, Twilio for
SMS delivery. (Removed 2026-05-08 — see above.)

**Why:** Standard practice for booking platforms to verify phone numbers before storing
payment details. Wanted to tie the card to a verified identity.

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
