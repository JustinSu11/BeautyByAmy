# BeautyByAmy — Codebase Appendix

A directory-by-directory and file-by-file reference for developers. Describes what each file does,
why it exists, and any non-obvious conventions.

---

## Repository Root

```
BeautyByAmy/
├── src/                      Application source code
├── public/                   Static assets
├── drizzle/                  Auto-generated SQL migrations
├── scripts/                  One-time database seed scripts
├── supabase/                 Legacy schema reference (superseded by Drizzle)
├── docs/                     Developer documentation (you are here)
├── node_modules/             Installed dependencies
├── make-lash-waiver-fillable.mjs   One-time PDF utility script (see below)
├── seed-waiver-test.mjs      Dev-only script for testing the waiver flow locally
├── package.json              Project dependencies and scripts
├── package-lock.json         Lockfile
├── drizzle.config.ts         Drizzle Kit configuration
├── middleware.ts             Next.js Edge middleware (admin auth guard)
├── next.config.ts            Next.js configuration
├── vercel.json               Vercel cron job configuration
├── vitest.config.ts          Vitest test runner configuration
├── tailwind.config.mjs       Tailwind CSS configuration
├── postcss.config.mjs        PostCSS configuration
├── components.json           shadcn/ui configuration
├── eslint.config.mjs         ESLint flat config
├── tsconfig.json             TypeScript configuration
├── .env                      Local secrets — NOT committed (gitignored)
├── .env.example              Template showing required env vars
├── CLAUDE.md                 Project orientation for developers / AI sessions
└── README.md                 Public-facing project README
```

### `make-lash-waiver-fillable.mjs`
One-time developer utility run from the repo root to generate the fillable lash waiver PDF.

```
node make-lash-waiver-fillable.mjs
```

**Input:** `C:\Users\justi\Downloads\eyelash-waiver-flat.pdf` (exported from Word)
**Output:** `public/waivers/lash-waiver.pdf`

Uses `pdf-lib` to overlay AcroForm fields (text inputs, checkboxes, radio groups) onto the
flat PDF at precise coordinates. Re-run only if the Word source document changes; the output
PDF is committed and served statically.

---

## `docs/`

```
docs/
├── APPENDIX.md          This file — full codebase reference
├── DECISIONS.md         Architecture decision log (what, why, alternatives considered)
└── superpowers/
    └── plans/           AI-assisted implementation plans (historical, for reference)
```

---

## Top-Level Config Files

### `middleware.ts`
Edge middleware that runs before every matched route. Currently guards all `/admin/*` routes —
if the request has no valid NextAuth session, it redirects to `/login`. Uses `auth()` from
`@/lib/auth`.

### `vercel.json`
Configures Vercel-managed cron jobs. Currently declares one job:
- **`/api/cron/waiver-reminders`** — runs daily at 10:00 AM UTC

### `drizzle.config.ts`
Tells Drizzle Kit where the schema lives, where to write migrations, and how to connect to the
database. Used by `npx drizzle-kit push` (apply schema to DB) and `npx drizzle-kit generate`
(generate SQL migration files).

---

## `src/app/` — Pages and API Routes

Next.js App Router. Each folder is a route segment. `page.tsx` renders the UI; `route.ts`
handles HTTP requests (API routes); `layout.tsx` wraps child segments.

```
src/app/
├── layout.tsx                Root layout — sets <html> metadata, wraps all pages in providers
├── globals.css               Global CSS — Tailwind base layer + CSS custom properties
├── page.tsx                  Home / landing page
│
├── booking/
│   └── page.tsx              Multi-step booking flow (service → date/time → customer info → payment)
│
├── services/
│   └── page.tsx              Full service catalog, grouped by category with sticky nav
│
├── gallery/
│   └── page.tsx              Public photo gallery — fetches images from Cloudinary via DB
│
├── contact/
│   └── page.tsx              Contact information and location
│
├── policies/
│   └── page.tsx              Cancellation policy, late policy, COVID policy
│
├── waiver/
│   ├── page.tsx              Waiver landing page — validates token, decides which form variant
│   └── waiver-form.tsx       Multi-step HTML waiver wizard (lash / PMU / re-consent variants)
│                             Note: superseded by the PDF-email approach; kept for fallback
│
├── login/
│   └── page.tsx              Admin login page — Google OAuth via NextAuth
│
├── admin/
│   ├── layout.tsx            Admin shell — wraps all admin pages with sidebar navigation
│   ├── page.tsx              Admin dashboard (overview / redirect to waivers)
│   ├── waivers/
│   │   └── page.tsx          Waiver log — table of all signed waivers with customer + date
│   ├── services/
│   │   └── page.tsx          Service management — view, create, edit, delete services
│   ├── gallery/
│   │   └── page.tsx          Gallery management — upload, reorder, delete gallery images
│   ├── images/
│   │   └── page.tsx          Site image management — hero, meet-amy, and other site-wide images
│   └── announcements/
│       └── page.tsx          Announcement banner management — set/clear the sitewide banner
│
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts      NextAuth catch-all route — handles OAuth callbacks
    │
    ├── bookings/
    │   └── route.ts          POST — creates Square customer, saves card on file, creates Square
    │                         appointment, inserts booking + waiver token to DB, sends waiver
    │                         email via Resend if required
    │
    ├── waivers/
    │   └── sign/
    │       └── route.ts      POST — validates waiver token, inserts signed waiver to DB,
    │                         marks token used, stamps waiverReceivedAt, appends Square note
    │
    ├── cron/
    │   └── waiver-reminders/
    │       └── route.ts      GET (cron) — runs daily at 10 AM; finds bookings within 3 days
    │                         that still need a waiver and sends SMS reminders via Twilio
    │
    └── admin/
        ├── services/
        │   ├── route.ts          GET all / POST new service
        │   └── [id]/route.ts     GET one / PATCH / DELETE service by ID
        ├── gallery/
        │   ├── route.ts          GET all / POST upload gallery image (Cloudinary)
        │   └── [id]/route.ts     PATCH (reorder) / DELETE gallery image
        ├── announcements/
        │   ├── route.ts          GET active / POST new announcement
        │   └── [id]/route.ts     DELETE announcement by ID
        ├── site-images/
        │   └── route.ts          GET all / POST upload site-wide image (hero, meet-amy, etc.)
        └── waivers/
            ├── route.ts          GET all waivers (admin list)
            ├── [id]/route.ts     GET waiver detail by ID
            └── [id]/download/
                └── route.ts      GET — streams a waiver PDF download (currently a stub for
                                  digital waivers; PDF-email approach means signed PDFs live in
                                  the client's inbox, not in our storage)
```

---

## `src/components/` — React Components

Organized by feature area. Components are client or server as indicated.

```
src/components/
├── ui/                          Primitive UI components (shadcn/ui generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── navigation-menu.tsx
│   ├── scroll-area.tsx
│   ├── sheet.tsx                Mobile drawer/sheet primitive
│   ├── sonner.tsx               Toast notification component (wraps Sonner library)
│   └── spa-icon.jsx             Custom SVG spa/leaf icon
│
├── landing/                     Sections rendered on the home page
│   ├── hero-section.tsx         Full-bleed hero with CTA button
│   ├── featured-services-section.tsx   Highlighted service cards
│   ├── gallery-section.tsx      Preview gallery grid
│   ├── meet-amy-section.tsx     Artist bio and photo
│   ├── testimonial-section.tsx  Customer review cards
│   └── cta-section.tsx          Bottom call-to-action band
│
├── booking/                     Components used in the multi-step booking flow
│   ├── booking-steps.tsx        Step indicator / progress bar
│   ├── booking-header.tsx       Page header with step title
│   ├── booking-summary.tsx      Sidebar summary of selected service + date
│   ├── booking-calendar.tsx     Date picker (fetches Square availability)
│   ├── time-slot-grid.tsx       Grid of available time slots for a selected date
│   ├── service-card.tsx         Individual service option card
│   ├── service-list.tsx         Scrollable list of services filtered by category
│   ├── service-dropdown.tsx     Category filter dropdown
│   ├── confirm-modal.tsx        Final confirmation modal before submitting booking
│   └── mobile-booking-bar.tsx   Fixed bottom bar showing summary on mobile
│
├── services/
│   └── services-sticky-nav.tsx  Category navigation that sticks to top while scrolling
│
├── admin/                       Components used only in admin pages
│   ├── admin-sidebar.tsx        Left navigation sidebar for all admin pages
│   ├── service-table.tsx        Data table for listing and managing services
│   ├── service-form.tsx         Create/edit form for a single service
│   ├── gallery-grid.tsx         Drag-to-reorder grid of gallery images
│   ├── image-uploader.tsx       Drag-and-drop image upload widget
│   └── waiver-upload-form.tsx   Form for Amy to manually upload a signed waiver PDF
│
├── announcement-banner.tsx      Sitewide dismissible announcement banner (shown at top of every page)
├── site-nav.tsx                 Public site navigation header
└── site-footer.tsx              Public site footer
```

---

## `src/lib/` — Shared Utilities and Service Integrations

Server-side modules. None of these are safe to import in client components unless noted.

```
src/lib/
├── auth.ts             NextAuth v5 configuration — Google provider, Drizzle adapter, session
│                       strategy. Exports `auth()` used by middleware and API routes.
│
├── booking-context.tsx React Context + Provider for the multi-step booking flow. Holds
│                       selected service, date, customer info state across steps. Client-only.
│
├── cloudinary.ts       Cloudinary SDK wrapper. Exports `uploadFile(buffer, folder)` and
│                       `deleteFile(publicId)`. Used by admin image upload routes.
│
├── config.ts           Zod schema for the booking checkout payload (`CheckoutSchema`).
│                       Shared validation used by both client-side forms and the API route.
│
├── email.ts            Resend email client. Exports `sendWaiverEmail()` which attaches the
│                       appropriate waiver PDF (lash / pmu / reconsent) and sends a branded
│                       confirmation email to the client. PDFs are read from public/waivers/.
│
├── logger.ts           Thin logging wrapper (console-based). Provides structured log output
│                       with context objects for server-side errors.
│
├── services-data.ts    Canonical service catalog. Exports `services[]` (all 31 services with
│                       name, price, duration, category, requiresWaiver, waiverValidityDays)
│                       and helpers `getServicesByCategory()`, `getServiceById()`.
│                       This is the source of truth for service metadata — Square catalog IDs
│                       are mapped here rather than queried at runtime.
│
├── slots.ts            Time slot generation logic. Given Square availability data, produces
│                       a list of bookable slots for a given date filtered by business hours
│                       and existing bookings.
│
├── sms.ts              Twilio SMS client wrapper. Exports `sendSms(to, body)`. Used by the
│                       waiver-reminders cron job to send reminder links.
│
├── square.ts           Square API client and helpers. Exports:
│                       - `squareClient` — authenticated Square SDK instance (sandbox in dev,
│                         production in prod, switched via NODE_ENV)
│                       - `upsertSquareCustomer()` — find-or-create customer by phone
│                       - `saveCardOnFile()` — tokenize and store card to Square customer
│                       - `createSquareAppointment()` — create booking on Amy's calendar
│                       - `appendCustomerNote()` — append text note to Square customer profile
│
├── utils.ts            General utility functions (cn() class merging helper from shadcn/ui).
│
├── validate.ts         Zod schema for checkout form input. Shared between client form
│                       validation and the POST /api/bookings route body parse.
│
└── waiver-config.ts    Single export: `CURRENT_WAIVER_VERSION` (date string, e.g. '2026-05-05').
                        Bumping this string invalidates all existing waivers and forces everyone
                        to re-sign on their next booking.
```

---

## `src/db/` — Database Layer

```
src/db/
├── index.ts      Creates and exports the Drizzle ORM client (`db`) connected to Neon via
│                 `@neondatabase/serverless`. This is the only place the DB connection is
│                 instantiated — all queries import `db` from here.
│
└── schema.ts     Drizzle table definitions (the source of truth for the DB schema):
                  - `customers`      — one row per unique person; keyed by Square customer ID
                  - `bookings`       — one row per appointment; tracks waiver state
                  - `waiver_tokens`  — single-use signed URLs; expire at appointment start
                  - `waivers`        — signed consent records with expiry window
                  - `services`       — CMS-managed service catalog rows
                  - `gallery_images` — Cloudinary image metadata for public gallery
                  - `site_images`    — Cloudinary image metadata for site-wide images (hero, etc.)
                  - `announcements`  — sitewide banner messages
```

---

## `src/data/` — Static Data

```
src/data/
├── holidays.ts    List of US federal holidays and observed closure dates. Used by the booking
│                  calendar to disable unavailable days.
│
└── services.ts    Legacy static service list (predates the DB-backed services table).
                   Kept for reference; active data comes from the DB / services-data.ts.
```

---

## `src/hooks/` — Custom React Hooks

```
src/hooks/
├── use-mobile.ts          Returns `true` if viewport width is below the mobile breakpoint.
│                          Used to conditionally render mobile vs desktop layouts.
│
├── use-scroll-animate.ts  IntersectionObserver-based hook for scroll-triggered animations.
│                          Returns a ref and a boolean `isVisible`.
│
├── useMediaQuery.ts       Generic media query hook — takes a CSS media query string, returns
│                          a boolean. Used internally by use-mobile.ts.
│
└── useToast.ts            Wrapper around Sonner's imperative toast API for consistency.
```

---

## `src/types/` — Shared TypeScript Types

```
src/types/
├── booking.ts    Types for booking flow state (step identifiers, form values).
└── service.ts    Service type definition shared between services-data.ts and components.
```

---

## `src/tests/` — Tests

```
src/tests/
└── auth.test.ts    Basic auth flow tests (Vitest). Coverage is minimal — testing is an active
                    learning objective for this project.
```

---

## `public/` — Static Assets

Served directly by Next.js at the root URL path. No authentication or processing.

```
public/
├── icon.svg               Favicon (SVG)
├── icon-light-32x32.png   Favicon for light mode
├── icon-dark-32x32.png    Favicon for dark mode
├── apple-icon.png         Apple touch icon
├── admin-preview.html     Static HTML preview of admin UI (design reference, not a live page)
├── images/                Site images (hero photo, Amy headshot, etc.)
└── waivers/               Waiver PDF files attached to booking confirmation emails
    ├── lash-waiver.pdf        Fillable AcroForm PDF for eyelash extension clients
    ├── pmu-consent.pdf        Fillable PDF for first-time permanent makeup clients
    └── pmu-reconsent.pdf      Flat PDF for PMU touch-up clients (re-consent / touch-up form)
```

> **Regenerating `lash-waiver.pdf`:** If the source Word doc changes, export it as a flat PDF,
> place it at `C:\Users\justi\Downloads\eyelash-waiver-flat.pdf`, then run
> `node make-lash-waiver-fillable.mjs` from the repo root. Commit the new PDF.

---

## `drizzle/migrations/`

Auto-generated SQL files produced by `npx drizzle-kit generate`. Applied to the Neon database
with `npx drizzle-kit push`. Do not edit these files by hand — modify `src/db/schema.ts` and
re-run the kit.

---

## `scripts/`

One-time Node.js scripts for seeding the database. Not imported by the application.

```
scripts/
├── seed-services.ts    Seeds the `services` table from the static services-data.ts catalog.
│                       Run once after initial DB setup.
└── seed-gallery.ts     Seeds the `gallery_images` table with initial Cloudinary image records.
```

There is also `seed-waiver-test.mjs` at `apps/web/` root (not inside `scripts/`) — this is a
development-only script that creates a fake customer + booking + waiver token for testing the
waiver flow locally:

```bash
node apps/web/seed-waiver-test.mjs [lash|pmu|reconsent]
```

---

## Key Environment Variables

Defined in `apps/web/.env` (see `.env.example` for the full list):

| Variable | Used By | Purpose |
|---|---|---|
| `DATABASE_URL` | `src/db/index.ts`, drizzle-kit | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | `src/lib/auth.ts` | NextAuth session signing secret |
| `NEXTAUTH_URL` | NextAuth | Canonical site URL for OAuth callbacks |
| `GOOGLE_CLIENT_ID` | `src/lib/auth.ts` | Google OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | `src/lib/auth.ts` | Google OAuth app secret |
| `NEXT_PUBLIC_SQUARE_APPLICATION_ID` | booking page (browser) | Square Web Payments SDK init |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | booking page (browser) | Square location for availability |
| `SQUARE_ACCESS_TOKEN` | `src/lib/square.ts` | Square server-side API token |
| `CLOUDINARY_CLOUD_NAME` | `src/lib/cloudinary.ts` | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | `src/lib/cloudinary.ts` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `src/lib/cloudinary.ts` | Cloudinary API secret |
| `RESEND_API_KEY` | `src/lib/email.ts` | Resend API key for sending waiver emails |
| `TWILIO_ACCOUNT_SID` | `src/lib/sms.ts` | Twilio account for SMS reminders |
| `TWILIO_AUTH_TOKEN` | `src/lib/sms.ts` | Twilio auth token |
| `TWILIO_FROM_NUMBER` | `src/lib/sms.ts` | Twilio sender phone number |
| `CRON_SECRET` | `api/cron/waiver-reminders` | Bearer token Vercel sends to authenticate cron calls |
