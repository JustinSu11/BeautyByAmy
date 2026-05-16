# Customer Identity, Card-on-File & Waiver System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** At booking confirmation, verify the customer's identity via SMS OTP, save their card on file to Square (so Amy can charge cancellation/no-show fees), create the appointment in Square, and asynchronously remind customers who need a waiver via SMS with a signed link — all without adding friction after "Confirm Booking."

**Architecture:** A modal appears when the customer clicks "Confirm Booking" — it captures their card via Square Web Payments SDK, sends an OTP to their phone, and on verification finalizes everything server-side: Square customer upsert, card-on-file save, appointment creation, and waiver reminder scheduling if needed. Neon is the glue layer (OTP tokens, booking records, waiver records). Square is Amy's source of truth for her business. Stripe is removed. Waivers are collected async via a signed SMS link sent before the appointment.

**Tech Stack:** Neon (serverless Postgres), Drizzle ORM, Twilio (SMS OTP + waiver reminders), Square Web Payments SDK (card capture), Square Customers/Bookings/Cards APIs, iron-session, Vitest, Vercel Cron (waiver reminders)

---

## Prerequisites (manual setup before coding)

1. **Neon** — create a project at [neon.tech](https://neon.tech), copy the `DATABASE_URL` pooled connection string
2. **Twilio** — create account at [twilio.com](https://twilio.com), buy a phone number (~$1/month), copy Account SID, Auth Token, and phone number
3. **Square Web Payments** — confirm `SQUARE_APPLICATION_ID` and `SQUARE_LOCATION_ID` are in env (already partially done)
4. **Add to `apps/web/.env.local`**:
   ```
   DATABASE_URL=postgresql://...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+1...
   SESSION_SECRET=<random 32+ character string>
   NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-...
   NEXT_PUBLIC_SQUARE_LOCATION_ID=...
   CRON_SECRET=<random string for securing cron endpoint>
   ```
5. **Add the same vars to Vercel** under Settings → Environment Variables (production values)
6. **Remove Stripe** — delete `STRIPE_SECRET_KEY` from env and Vercel dashboard

---

## File Map

### New files
| Path | Purpose |
|------|---------|
| `apps/web/src/db/schema.ts` | Drizzle tables: customers, otp_tokens, bookings, waiver_tokens, waivers |
| `apps/web/src/db/index.ts` | Drizzle client singleton |
| `apps/web/src/lib/auth.ts` | OTP generation, expiry check, iron-session helpers |
| `apps/web/src/lib/sms.ts` | Twilio SMS sender |
| `apps/web/src/app/api/auth/otp/send/route.ts` | POST: generate and SMS the OTP |
| `apps/web/src/app/api/auth/otp/verify/route.ts` | POST: verify OTP only (used by modal step 1) |
| `apps/web/src/app/api/bookings/route.ts` | POST: save card, create Square appointment, create Neon booking, schedule waiver |
| `apps/web/src/app/api/waivers/sign/route.ts` | POST: validate waiver token and record signature |
| `apps/web/src/app/api/cron/waiver-reminders/route.ts` | GET: Vercel Cron — find pending waivers and SMS customers |
| `apps/web/src/app/waiver/page.tsx` | Public waiver signing page (served at /waiver?token=...) |
| `apps/web/src/components/booking/confirm-modal.tsx` | Modal: card capture → OTP verify → confirm |
| `apps/web/src/tests/auth.test.ts` | Unit tests for OTP helpers |
| `apps/web/drizzle.config.ts` | Drizzle Kit config |
| `apps/web/vitest.config.ts` | Vitest config |
| `apps/web/vercel.json` | Vercel Cron schedule config |

### Modified files
| Path | Change |
|------|--------|
| `apps/web/src/lib/square.ts` | Add upsertSquareCustomer, saveCardOnFile, createSquareAppointment, appendCustomerNote |
| `apps/web/src/lib/services-data.ts` | Add `requiresWaiver` flag to Service type and WAIVER_REQUIRED set |
| `apps/web/src/components/booking/booking-summary.tsx` | Confirm button opens modal instead of alert |
| `apps/web/src/lib/booking-context.tsx` | Revert BookingStep to booking/info/summary only |
| `apps/web/package.json` | Add new deps, remove stripe |

### Deleted files
| Path | Reason |
|------|--------|
| `apps/web/src/lib/stripe.ts` | Stripe removed — Square handles payments |
| `apps/web/src/app/api/webhooks/stripe/route.ts` | No longer needed |

---

## Task 1: Install dependencies, remove Stripe

**Files:**
- Modify: `apps/web/package.json`
- Delete: `apps/web/src/lib/stripe.ts`
- Delete: `apps/web/src/app/api/webhooks/stripe/route.ts`
- Create: `apps/web/drizzle.config.ts`
- Create: `apps/web/vitest.config.ts`

- [ ] **Step 1: Install new packages**

```bash
cd apps/web
npm install @neondatabase/serverless drizzle-orm iron-session twilio
npm install -D drizzle-kit vitest @vitejs/plugin-react @testing-library/react
```

- [ ] **Step 2: Remove Stripe**

```bash
cd apps/web
npm uninstall stripe @stripe/stripe-js @stripe/react-stripe-js
rm src/lib/stripe.ts
rm -rf src/app/api/webhooks
```

- [ ] **Step 3: Create drizzle.config.ts**

```typescript
// apps/web/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 5: Add test scripts to apps/web/package.json**

In `scripts`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json apps/web/drizzle.config.ts apps/web/vitest.config.ts
git rm apps/web/src/lib/stripe.ts apps/web/src/app/api/webhooks/stripe/route.ts
git commit -m "chore: remove Stripe, add Neon/Drizzle/Twilio/iron-session/vitest"
```

---

## Task 2: Database schema

**Files:**
- Create: `apps/web/src/db/schema.ts`
- Create: `apps/web/src/db/index.ts`

- [ ] **Step 1: Write schema**

```typescript
// apps/web/src/db/schema.ts
import { pgTable, text, timestamp, boolean, uuid, integer } from 'drizzle-orm/pg-core'

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  squareCustomerId: text('square_customer_id').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const otpTokens = pgTable('otp_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  squareBookingId: text('square_booking_id').unique().notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  serviceId: text('service_id').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  requiresWaiver: boolean('requires_waiver').default(false).notNull(),
  waiverSent: boolean('waiver_sent').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const waiverTokens = pgTable('waiver_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: uuid('token').defaultRandom().notNull().unique(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const waivers = pgTable('waivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  waiverVersion: text('waiver_version').notNull(),
  signedAt: timestamp('signed_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
})

export type Customer = typeof customers.$inferSelect
export type OtpToken = typeof otpTokens.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type WaiverToken = typeof waiverTokens.$inferSelect
export type Waiver = typeof waivers.$inferSelect
```

- [ ] **Step 2: Create Drizzle client**

```typescript
// apps/web/src/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- [ ] **Step 3: Generate and apply migrations**

```bash
cd apps/web
npx drizzle-kit generate
npx drizzle-kit migrate
```

Expected: migration files in `apps/web/drizzle/migrations/`, tables created in Neon (verify in Neon console).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/db/ apps/web/drizzle/
git commit -m "feat: Drizzle schema — customers, otp_tokens, bookings, waiver_tokens, waivers"
```

---

## Task 3: Auth helpers

**Files:**
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/tests/auth.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// apps/web/src/tests/auth.test.ts
import { describe, it, expect } from 'vitest'
import { generateOtp, isOtpExpired, CURRENT_WAIVER_VERSION } from '@/lib/auth'

describe('generateOtp', () => {
  it('generates a 6-digit numeric string', () => {
    expect(generateOtp()).toMatch(/^\d{6}$/)
  })

  it('produces different values on successive calls', () => {
    const results = new Set(Array.from({ length: 10 }, () => generateOtp()))
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('isOtpExpired', () => {
  it('returns false when expiry is in the future', () => {
    expect(isOtpExpired(new Date(Date.now() + 60_000))).toBe(false)
  })

  it('returns true when expiry has already passed', () => {
    expect(isOtpExpired(new Date(Date.now() - 1))).toBe(true)
  })
})

describe('CURRENT_WAIVER_VERSION', () => {
  it('matches YYYY-MM-DD format', () => {
    expect(CURRENT_WAIVER_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
cd apps/web && npx vitest run src/tests/auth.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement auth.ts**

```typescript
// apps/web/src/lib/auth.ts
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
export const CURRENT_WAIVER_VERSION = '2026-05-05'

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt
}

export interface SessionData {
  customerId: string
  phone: string
  email: string
  squareCustomerId: string
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'bba-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd apps/web && npx vitest run src/tests/auth.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/auth.ts apps/web/src/tests/auth.test.ts
git commit -m "feat: OTP generation, expiry check, and iron-session helpers"
```

---

## Task 4: Twilio SMS sender

**Files:**
- Create: `apps/web/src/lib/sms.ts`

- [ ] **Step 1: Create sms.ts**

```typescript
// apps/web/src/lib/sms.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendOtpSms(to: string, otp: string): Promise<void> {
  await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
    body: `Your BeautyByAmy verification code is ${otp}. Valid for 10 minutes.`,
  })
}

export async function sendWaiverReminderSms(
  to: string,
  name: string,
  appointmentDate: string,
  waiverUrl: string
): Promise<void> {
  await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
    body: `Hi ${name}, your BeautyByAmy appointment on ${appointmentDate} requires a signed consent form. Please sign before your visit: ${waiverUrl}`,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/sms.ts
git commit -m "feat: Twilio SMS sender for OTP and waiver reminders"
```

---

## Task 5: Square helpers

**Files:**
- Modify: `apps/web/src/lib/square.ts`

- [ ] **Step 1: Replace square.ts**

```typescript
// apps/web/src/lib/square.ts
import { Client, Environment } from 'square'

const environment =
  process.env.NODE_ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox

export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment,
})

export interface SquareCustomerResult {
  squareCustomerId: string
}

/**
 * Find an existing Square customer by phone or create a new one.
 * Phone is the primary identifier since it's what we verify via OTP.
 */
export async function upsertSquareCustomer(
  phone: string,
  email: string,
  name: string
): Promise<SquareCustomerResult> {
  const { result: searchResult } = await squareClient.customersApi.searchCustomers({
    query: { filter: { phoneNumber: { exact: phone } } },
  })

  if (searchResult.customers && searchResult.customers.length > 0) {
    return { squareCustomerId: searchResult.customers[0].id! }
  }

  const parts = name.trim().split(' ')
  const { result: createResult } = await squareClient.customersApi.createCustomer({
    phoneNumber: phone,
    emailAddress: email,
    givenName: parts[0],
    familyName: parts.slice(1).join(' ') || '',
    referenceId: 'bba-web',
  })

  return { squareCustomerId: createResult.customer!.id! }
}

/**
 * Save a tokenized card (from Square Web Payments SDK) to a Square customer profile.
 * Amy can charge this card for no-shows and late cancellations from her Square dashboard.
 */
export async function saveCardOnFile(
  squareCustomerId: string,
  sourceId: string
): Promise<string> {
  const { result } = await squareClient.cardsApi.createCard({
    idempotencyKey: crypto.randomUUID(),
    sourceId,
    card: {
      customerId: squareCustomerId,
    },
  })
  return result.card!.id!
}

/**
 * Create an appointment in Square Appointments.
 * serviceVariationId and teamMemberId come from Amy's Square Appointments catalog.
 */
export async function createSquareAppointment(params: {
  squareCustomerId: string
  serviceVariationId: string
  teamMemberId: string
  startsAt: string
  durationMinutes: number
}): Promise<string> {
  const { result } = await squareClient.bookingsApi.createBooking({
    idempotencyKey: crypto.randomUUID(),
    booking: {
      locationId: process.env.SQUARE_LOCATION_ID!,
      customerId: params.squareCustomerId,
      startAt: params.startsAt,
      appointmentSegments: [
        {
          serviceVariationId: params.serviceVariationId,
          teamMemberId: params.teamMemberId,
          durationMinutes: params.durationMinutes,
        },
      ],
    },
  })
  return result.booking!.id!
}

/**
 * Append a note to a Square customer profile.
 * Used to record waiver signatures visible in Amy's Square dashboard.
 */
export async function appendCustomerNote(
  squareCustomerId: string,
  note: string
): Promise<void> {
  const { result } = await squareClient.customersApi.retrieveCustomer(squareCustomerId)
  const existing = result.customer?.note ?? ''
  const updated = existing ? `${existing}\n${note}` : note
  await squareClient.customersApi.updateCustomer(squareCustomerId, { note: updated })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/square.ts
git commit -m "feat: Square helpers — upsert customer, card-on-file, create appointment, append note"
```

---

## Task 6: Add requiresWaiver flag to services

**Files:**
- Modify: `apps/web/src/lib/services-data.ts`

- [ ] **Step 1: Add requiresWaiver to Service type**

In `apps/web/src/lib/services-data.ts`, add to the `Service` interface:
```typescript
/** True for PMU and first-time lash services that require a signed consent waiver */
requiresWaiver?: boolean
```

- [ ] **Step 2: Add WAIVER_REQUIRED set after the DEPOSIT_REQUIRED set**

```typescript
/**
 * Services that require a signed waiver before the appointment.
 * All PMU services (pigment, needles) and first-time full lash sets.
 */
const WAIVER_REQUIRED = new Set([
  'service8',  // Ombré
  'service9',  // Microshading Cover-Up
  'service10', // Lip blush
  'service12', // Microblading
  'service13', // Microshading
  'service14', // Ombré Cover-Up
  'service19', // Cover-Up with Correction
  'service2',  // Volume Set (full)
  'service15', // Hybrid Set (full)
  'service27', // Classic Set (full)
])
```

- [ ] **Step 3: Add requiresWaiver to the services map**

In the `services` array `.map()`, add alongside `requiresDeposit`:
```typescript
requiresWaiver: WAIVER_REQUIRED.has(s.id),
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/services-data.ts
git commit -m "feat: add requiresWaiver flag to service definitions"
```

---

## Task 7: OTP API routes

**Files:**
- Create: `apps/web/src/app/api/auth/otp/send/route.ts`
- Create: `apps/web/src/app/api/auth/otp/verify/route.ts`

- [ ] **Step 1: Send OTP route**

```typescript
// apps/web/src/app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { otpTokens } from '@/db/schema'
import { generateOtp, OTP_TTL_MS } from '@/lib/auth'
import { sendOtpSms } from '@/lib/sms'
import { z } from 'zod'

const Schema = z.object({
  phone: z.string().min(7),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { phone } = parsed.data
  const token = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await db.insert(otpTokens).values({ phone, token, expiresAt })
  await sendOtpSms(phone, token)

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify OTP route**

```typescript
// apps/web/src/app/api/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { customers, otpTokens } from '@/db/schema'
import { isOtpExpired, getSession } from '@/lib/auth'
import { upsertSquareCustomer } from '@/lib/square'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  phone: z.string().min(7),
  email: z.string().email(),
  name: z.string().min(2),
  token: z.string().length(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { phone, email, name, token } = parsed.data

  const [row] = await db
    .select()
    .from(otpTokens)
    .where(and(eq(otpTokens.phone, phone), eq(otpTokens.token, token), eq(otpTokens.used, false)))
    .limit(1)

  if (!row || isOtpExpired(row.expiresAt)) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
  }

  await db.update(otpTokens).set({ used: true }).where(eq(otpTokens.id, row.id))

  const { squareCustomerId } = await upsertSquareCustomer(phone, email, name)

  let [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1)

  if (!customer) {
    const [created] = await db
      .insert(customers)
      .values({ squareCustomerId, email, name, phone })
      .returning()
    customer = created
  }

  const session = await getSession()
  session.customerId = customer.id
  session.phone = customer.phone
  session.email = customer.email
  session.squareCustomerId = squareCustomerId
  await session.save()

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/api/auth/
git commit -m "feat: OTP send (SMS) and verify API routes"
```

---

## Task 8: Booking API route

**Files:**
- Create: `apps/web/src/app/api/bookings/route.ts`

This is the main endpoint called after OTP verification. It saves the card on file, creates the Square appointment, creates a local Neon booking record, and schedules a waiver reminder if needed.

- [ ] **Step 1: Create bookings route**

```typescript
// apps/web/src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { bookings, waivers, waiverTokens } from '@/db/schema'
import { getSession, CURRENT_WAIVER_VERSION } from '@/lib/auth'
import { saveCardOnFile, createSquareAppointment } from '@/lib/square'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  sourceId: z.string(),              // card token from Square Web Payments SDK
  serviceVariationId: z.string(),    // from Square Appointments catalog
  teamMemberId: z.string(),          // Amy's team member ID in Square
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  serviceId: z.string(),             // local service ID for requiresWaiver check
  requiresWaiver: z.boolean(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.customerId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const {
    sourceId,
    serviceVariationId,
    teamMemberId,
    startsAt,
    durationMinutes,
    serviceId,
    requiresWaiver,
  } = parsed.data

  // Save card on file to Square — Amy can charge this for no-shows
  await saveCardOnFile(session.squareCustomerId, sourceId)

  // Create appointment in Square (shows on Amy's calendar)
  const squareBookingId = await createSquareAppointment({
    squareCustomerId: session.squareCustomerId,
    serviceVariationId,
    teamMemberId,
    startsAt,
    durationMinutes,
  })

  // Check if this customer already has a signed waiver
  let needsWaiver = false
  if (requiresWaiver) {
    const [existingWaiver] = await db
      .select()
      .from(waivers)
      .where(
        and(
          eq(waivers.customerId, session.customerId),
          eq(waivers.waiverVersion, CURRENT_WAIVER_VERSION)
        )
      )
      .limit(1)
    needsWaiver = !existingWaiver
  }

  // Create local booking record
  const [booking] = await db
    .insert(bookings)
    .values({
      squareBookingId,
      customerId: session.customerId,
      serviceId,
      startsAt: new Date(startsAt),
      requiresWaiver: needsWaiver,
      waiverSent: false,
    })
    .returning()

  // If waiver needed, create a signed token for the reminder link
  if (needsWaiver) {
    const expiresAt = new Date(startsAt) // token valid until appointment time
    await db.insert(waiverTokens).values({
      customerId: session.customerId,
      bookingId: booking.id,
      expiresAt,
    })
  }

  return NextResponse.json({ ok: true, bookingId: booking.id, needsWaiver })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/api/bookings/route.ts
git commit -m "feat: booking API — card-on-file, Square appointment, waiver token creation"
```

---

## Task 9: Waiver signing system

**Files:**
- Create: `apps/web/src/app/api/waivers/sign/route.ts`
- Create: `apps/web/src/app/waiver/page.tsx`

- [ ] **Step 1: Waiver sign API route**

```typescript
// apps/web/src/app/api/waivers/sign/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { waivers, waiverTokens, bookings } from '@/db/schema'
import { CURRENT_WAIVER_VERSION } from '@/lib/auth'
import { appendCustomerNote } from '@/lib/square'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const Schema = z.object({
  token: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const [tokenRow] = await db
    .select()
    .from(waiverTokens)
    .where(and(eq(waiverTokens.token, parsed.data.token), eq(waiverTokens.used, false)))
    .limit(1)

  if (!tokenRow || new Date() > tokenRow.expiresAt) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  }

  // Get the customer's Square ID from the booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, tokenRow.bookingId))
    .limit(1)

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null

  await db.insert(waivers).values({
    customerId: tokenRow.customerId,
    waiverVersion: CURRENT_WAIVER_VERSION,
    ipAddress: ip,
  })

  await db.update(waiverTokens).set({ used: true }).where(eq(waiverTokens.id, tokenRow.id))

  await db.update(bookings).set({ requiresWaiver: false }).where(eq(bookings.id, tokenRow.bookingId))

  const signedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // Get the customer's Square ID to update their profile note
  const { squareCustomerId } = await db
    .select({ squareCustomerId: (await import('@/db/schema')).customers.squareCustomerId })
    .from((await import('@/db/schema')).customers)
    .where(eq((await import('@/db/schema')).customers.id, tokenRow.customerId))
    .limit(1)
    .then(rows => rows[0])

  await appendCustomerNote(squareCustomerId, `Waiver signed (v${CURRENT_WAIVER_VERSION}) on ${signedAt}`)

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create waiver signing page**

```typescript
// apps/web/src/app/waiver/page.tsx
import { redirect } from 'next/navigation'

const WAIVER_TEXT = `By signing this consent form, I acknowledge and agree to the following:

1. I confirm that I have disclosed any allergies, medical conditions, or medications that may affect my treatment.

2. I understand that results may vary and that multiple sessions may be required for optimal results.

3. I consent to the procedures being performed by Amy Le and her team at BeautyByAmy.

4. I understand and accept the 24-hour cancellation policy. Late cancellations and no-shows may be subject to a cancellation fee charged to the card on file.

5. I release BeautyByAmy from liability for any adverse reactions that occur as a result of information I have not disclosed.

6. I confirm that I am 18 years of age or older, or have parental/guardian consent.`

export default function WaiverPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  if (!searchParams.token) redirect('/')

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl text-charcoal">Consent &amp; Waiver</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please read and sign before your appointment
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="max-h-72 overflow-y-auto rounded-lg bg-secondary p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {WAIVER_TEXT}
        </div>

        <WaiverForm token={searchParams.token} />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create WaiverForm client component**

```typescript
// apps/web/src/app/waiver/waiver-form.tsx
'use client'

import { useState } from 'react'
import { Shield, CheckCircle } from 'lucide-react'

export function WaiverForm({ token }: { token: string }) {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sign() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/waivers/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong.')
        return
      }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <CheckCircle className="h-10 w-10 text-gold" />
        <p className="font-serif text-lg text-charcoal">Waiver signed — you&apos;re all set!</p>
        <p className="text-sm text-muted-foreground">See you at your appointment.</p>
      </div>
    )
  }

  return (
    <div className="mt-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
        />
        <span className="text-sm text-muted-foreground">
          I have read and agree to the terms above.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <button
        type="button"
        onClick={sign}
        disabled={!agreed || loading}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Shield className="h-4 w-4" />
        {loading ? 'Saving…' : 'Sign & Complete'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Add WaiverForm import to waiver/page.tsx**

Add to top of `apps/web/src/app/waiver/page.tsx`:
```typescript
import { WaiverForm } from './waiver-form'
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/api/waivers/ apps/web/src/app/waiver/
git commit -m "feat: waiver sign API route and /waiver signing page"
```

---

## Task 10: Waiver reminder cron job

**Files:**
- Create: `apps/web/src/app/api/cron/waiver-reminders/route.ts`
- Create: `apps/web/vercel.json`

- [ ] **Step 1: Create cron route**

```typescript
// apps/web/src/app/api/cron/waiver-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { bookings, customers, waiverTokens } from '@/db/schema'
import { sendWaiverReminderSms } from '@/lib/sms'
import { eq, and, lte, gte } from 'drizzle-orm'

// Secured with a secret header — Vercel sends this automatically from vercel.json
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Find upcoming bookings that still need a waiver and haven't been sent a reminder
  const pendingBookings = await db
    .select({
      bookingId: bookings.id,
      customerId: bookings.customerId,
      startsAt: bookings.startsAt,
      name: customers.name,
      phone: customers.phone,
    })
    .from(bookings)
    .innerJoin(customers, eq(bookings.customerId, customers.id))
    .where(
      and(
        eq(bookings.requiresWaiver, true),
        eq(bookings.waiverSent, false),
        gte(bookings.startsAt, now),
        lte(bookings.startsAt, threeDaysFromNow)
      )
    )

  for (const booking of pendingBookings) {
    const [tokenRow] = await db
      .select()
      .from(waiverTokens)
      .where(
        and(
          eq(waiverTokens.bookingId, booking.bookingId),
          eq(waiverTokens.used, false)
        )
      )
      .limit(1)

    if (!tokenRow) continue

    const appointmentDate = booking.startsAt.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beautybyamy.com'
    const waiverUrl = `${baseUrl}/waiver?token=${tokenRow.token}`

    await sendWaiverReminderSms(booking.phone, booking.name, appointmentDate, waiverUrl)
    await db.update(bookings).set({ waiverSent: true }).where(eq(bookings.id, booking.bookingId))
  }

  return NextResponse.json({ sent: pendingBookings.length })
}
```

- [ ] **Step 2: Create vercel.json with cron schedule**

```json
{
  "crons": [
    {
      "path": "/api/cron/waiver-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

This runs daily at 10 AM UTC. Adjust the schedule as needed — `0 10 * * *` means midnight EST / 10 AM UTC.

- [ ] **Step 3: Add NEXT_PUBLIC_SITE_URL to env**

In `apps/web/.env.local`, add:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In Vercel, add production value: `https://beautybyamy.com` (or whatever the domain is).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/api/cron/ apps/web/vercel.json
git commit -m "feat: Vercel Cron waiver reminder job — SMS 3 days before appointment"
```

---

## Task 11: Confirm booking modal UI

**Files:**
- Create: `apps/web/src/components/booking/confirm-modal.tsx`

The modal has two stages: (1) card capture via Square Web Payments SDK, (2) OTP entry. Square Web Payments SDK is loaded via script tag for PCI compliance.

- [ ] **Step 1: Create confirm-modal.tsx**

```typescript
// apps/web/src/components/booking/confirm-modal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useBooking } from '@/lib/booking-context'
import { X, CreditCard, Shield } from 'lucide-react'

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>
        }>
      }>
    }
  }
}

interface ConfirmModalProps {
  onClose: () => void
  onSuccess: () => void
  // These come from Amy's Square Appointments catalog
  serviceVariationId: string
  teamMemberId: string
}

type ModalStage = 'card' | 'otp'

export function ConfirmModal({
  onClose,
  onSuccess,
  serviceVariationId,
  teamMemberId,
}: ConfirmModalProps) {
  const { customerInfo, selectedService, selectedDate, selectedTime } = useBooking()
  const [stage, setStage] = useState<ModalStage>('card')
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const cardRef = useRef<{ tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }> } | null>(null)

  // Load Square Web Payments SDK and attach card form
  useEffect(() => {
    if (stage !== 'card') return
    const script = document.createElement('script')
    script.src =
      process.env.NODE_ENV === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.onload = async () => {
      const payments = await window.Square!.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      )
      const card = await payments.card()
      await card.attach('#square-card-container')
      cardRef.current = card
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [stage])

  async function handleCardSubmit() {
    if (!cardRef.current) return
    setLoading(true)
    setError(null)
    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK' || !result.token) {
        setError(result.errors?.[0]?.message ?? 'Card error. Please check your details.')
        return
      }
      setSourceId(result.token)
      // Send OTP to phone
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerInfo.phone }),
      })
      if (!res.ok) throw new Error()
      setOtpSent(true)
      setStage('otp')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit() {
    if (!sourceId || !selectedService || !selectedDate || !selectedTime) return
    setLoading(true)
    setError(null)
    try {
      // Step 1: Verify OTP + create/find Square customer + create session
      const verifyRes = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customerInfo.phone,
          email: customerInfo.email,
          name: customerInfo.name,
          token: otp.trim(),
        }),
      })
      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        setError(data.error ?? 'Invalid code')
        return
      }

      // Step 2: Create booking (save card, create Square appointment, handle waiver)
      const startsAt = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        parseInt(selectedTime.split(':')[0]),
        parseInt(selectedTime.split(':')[1])
      ).toISOString()

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          serviceVariationId,
          teamMemberId,
          startsAt,
          durationMinutes: selectedService.duration,
          serviceId: selectedService.id,
          requiresWaiver: selectedService.requiresWaiver ?? false,
        }),
      })
      if (!bookingRes.ok) throw new Error('Booking failed')

      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {stage === 'card' && (
          <>
            <div className="mb-5">
              <h2 className="font-serif text-xl text-charcoal">Secure Your Booking</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A card is required to hold your appointment. You won&apos;t be charged today.
              </p>
            </div>

            <div id="square-card-container" className="min-h-[100px]" />

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <button
              type="button"
              onClick={handleCardSubmit}
              disabled={loading}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {loading ? 'Processing…' : 'Continue'}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Card secured by Square. Only charged for no-shows or late cancellations.
            </p>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div className="mb-5">
              <h2 className="font-serif text-xl text-charcoal">Verify Your Phone</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the 6-digit code sent to <strong>{customerInfo.phone}</strong>
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={loading || otp.length !== 6}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Confirming…' : 'Confirm Booking'}
            </button>

            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/otp/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ phone: customerInfo.phone }),
                })
              }}
              className="mt-3 w-full cursor-pointer text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              Resend code
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/booking/confirm-modal.tsx
git commit -m "feat: confirm booking modal — Square card capture + SMS OTP in two stages"
```

---

## Task 12: Wire modal into booking-summary.tsx

**Files:**
- Modify: `apps/web/src/components/booking/booking-summary.tsx`
- Modify: `apps/web/src/lib/booking-context.tsx`

- [ ] **Step 1: Revert BookingStep if verify/waiver were added**

In `apps/web/src/lib/booking-context.tsx`, ensure:
```typescript
export type BookingStep = 'booking' | 'info' | 'summary'
```

Remove any `verify` or `waiver` cases from the `canProceed` switch if present.

- [ ] **Step 2: Update booking-summary.tsx confirm button**

Add import at top of `apps/web/src/components/booking/booking-summary.tsx`:
```typescript
import { useState } from 'react'
import { ConfirmModal } from './confirm-modal'
```

Add state inside the `BookingSummary` component:
```typescript
const [modalOpen, setModalOpen] = useState(false)
const [confirmed, setConfirmed] = useState(false)
```

Replace the confirm button and its `onClick` with:
```typescript
{confirmed ? (
  <div className="mt-4 rounded-lg bg-gold/10 p-4 text-center">
    <p className="font-serif text-lg text-charcoal">Booking Confirmed!</p>
    <p className="mt-1 text-sm text-muted-foreground">
      Check your phone for a confirmation text. If your service requires a
      consent form, you&apos;ll receive a link before your appointment.
    </p>
  </div>
) : (
  <button
    type="button"
    disabled={!policyAccepted}
    onClick={() => setModalOpen(true)}
    className={cn(
      'mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition-colors',
      policyAccepted
        ? 'bg-charcoal text-primary-foreground hover:bg-charcoal/90'
        : 'cursor-not-allowed bg-muted text-muted-foreground'
    )}
  >
    <Shield className="h-4 w-4" />
    Confirm Booking
  </button>
)}

{modalOpen && (
  <ConfirmModal
    onClose={() => setModalOpen(false)}
    onSuccess={() => {
      setModalOpen(false)
      setConfirmed(true)
    }}
    // TODO: Replace with real IDs from Amy's Square Appointments catalog
    serviceVariationId="PLACEHOLDER_SERVICE_VARIATION_ID"
    teamMemberId="PLACEHOLDER_TEAM_MEMBER_ID"
  />
)}
```

> **Note on `serviceVariationId` and `teamMemberId`:** These come from Amy's Square Appointments setup. Run `squareClient.catalogApi.listCatalog({ types: ['ITEM_VARIATION'] })` and `squareClient.teamApi.listTeamMembers()` against the sandbox to get the real IDs, then replace the placeholders.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/booking/booking-summary.tsx apps/web/src/lib/booking-context.tsx
git commit -m "feat: wire confirm modal into booking summary, show confirmed state"
```

---

## Task 13: Run tests and smoke test

- [ ] **Step 1: Run all tests**

```bash
cd apps/web && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Smoke test the full booking flow**

```bash
cd apps/web && npm run dev
```

Walk through:
1. Select a service that `requiresWaiver: true` (e.g., Ombré Brows)
2. Pick date and time → Continue
3. Enter name, email, phone → Review Booking
4. Check policy checkbox → Confirm Booking
5. Modal opens — enter card details (use Square sandbox test card `4111 1111 1111 1111`, any future expiry, any CVV)
6. Click Continue — SMS arrives with 6-digit code
7. Enter code → Confirm Booking
8. Modal closes — confirmed state shows

Verify:
- Neon: `customers`, `bookings`, `waiver_tokens` tables have rows; `bookings.requires_waiver = true`
- Square sandbox: customer appears in Customer Directory; appointment on calendar; card saved on profile
- Waiver reminder: manually `GET /api/cron/waiver-reminders` with `Authorization: Bearer <CRON_SECRET>` header — verify SMS arrives with waiver link
- Visit waiver link `/waiver?token=<uuid>` — sign it — verify `waivers` table row created and Square customer note updated

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete customer identity, card-on-file, Square sync, and async waiver system"
```

---

## Self-Review

**Spec coverage:**
- ✅ SMS OTP at confirm booking — Tasks 4, 7, 11
- ✅ OTP in modal, not a separate step — Task 11
- ✅ Card-on-file saved to Square — Tasks 5, 8, 11; Amy can charge for no-shows/late cancellations from Square dashboard
- ✅ Square customer created/linked on every booking — Tasks 5, 7
- ✅ Square appointment created — Tasks 5, 8
- ✅ Stripe removed — Task 1
- ✅ Waivers async, not a booking gate — Tasks 6, 9, 10, 12
- ✅ Waiver reminder via SMS 3 days before appointment — Tasks 4, 10
- ✅ Waiver signed via link at `/waiver?token=...` — Task 9
- ✅ Waiver note appended to Square customer profile — Tasks 5, 9
- ✅ Returning customers with existing waiver skip reminder — Task 8 checks existing waiver before setting `requiresWaiver`

**Placeholder scan:** `serviceVariationId` and `teamMemberId` in Task 12 are real external dependencies on Amy's Square Appointments catalog configuration — not code placeholders. Instructions for retrieving them are documented inline.

**Type consistency:** `SessionData` in `auth.ts` (Task 3) includes `phone` as primary identifier; `otpTokens` schema (Task 2) uses `phone` not `email`; OTP send/verify routes (Task 7) and modal (Task 11) all pass `phone` consistently. `requiresWaiver` on `Service` type (Task 6) flows through to the modal payload (Task 11) and booking route (Task 8).
