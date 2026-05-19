// apps/web/src/db/schema.ts
import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from 'drizzle-orm/pg-core'

// ── Booking flow tables (existing) ───────────────────────────────────────────

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  squareCustomerId: text('square_customer_id').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  squareBookingId: text('square_booking_id').unique().notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  serviceId: text('service_id').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  requiresWaiver: boolean('requires_waiver').default(false).notNull(),
  waiverReceivedAt: timestamp('waiver_received_at'),
  waiverSentAt: timestamp('waiver_sent_at'),
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

// Digital waivers signed through the booking flow
export const waivers = pgTable('waivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  waiverVersion: text('waiver_version').notNull(),
  waiverType: text('waiver_type'),      // 'lash' | 'pmu' | 'reconsent' — null for legacy rows
  signedAt: timestamp('signed_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  formData: jsonb('form_data'),         // structured form answers (null for legacy rows)
})

// ── Admin CMS tables ──────────────────────────────────────────────────────────
// Note: property names use snake_case to match the DB column names directly,
// so Drizzle query results match the JSON shape the frontend expects.

// Admin-managed service menu for the public /services page
export const adminServices = pgTable('admin_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),        // 'lashes' | 'brows' | 'pmu' | 'addons'
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  group_label: text('group_label'),
  name: text('name').notNull(),
  duration: text('duration').notNull(),
  price: text('price').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  display_order: integer('display_order').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// Gallery images managed through the admin panel.
// Each row is one "card" — the primary image is the After shot (shown by default).
// If before_url is set, the card becomes a 2-item before/after carousel.
export const galleryImages = pgTable('gallery_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  cloudinary_id: text('cloudinary_id').notNull(),
  url: text('url').notNull(),
  blur_data_url: text('blur_data_url').notNull(),
  // Optional before image — when present the gallery card shows a carousel
  before_cloudinary_id: text('before_cloudinary_id'),
  before_url: text('before_url'),
  before_blur_data_url: text('before_blur_data_url'),
  category: text('category').notNull(),
  label: text('label').notNull(),
  display_order: integer('display_order').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// Site-wide announcement banner (only one active at a time)
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  message: text('message').notNull(),
  active: boolean('active').default(false).notNull(),
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  expires_at: timestamp('expires_at'),
  /** When set, the banner goes live automatically at this time even if active=false */
  scheduled_for: timestamp('scheduled_for'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// Named image slots on the public site (hero, meet-amy, gallery-1…6)
export const siteImages = pgTable('site_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  slot: text('slot').unique().notNull(),
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  cloudinary_id: text('cloudinary_id').notNull(),
  url: text('url').notNull(),
  blur_data_url: text('blur_data_url').notNull(),
  alt: text('alt').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// Waivers manually uploaded by admin (paper scans, external PDFs, etc.)
export const manualWaivers = pgTable('manual_waivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  client_name: text('client_name').notNull(),
  service: text('service').notNull(),
  appointment_date: timestamp('appointment_date'),
  signed_at: timestamp('signed_at').defaultNow().notNull(),
  cloudinary_id: text('cloudinary_id'),   // null when no file is attached
  cloudinary_url: text('cloudinary_url'), // direct Cloudinary URL for download
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// Category overrides for the public services page.
// When Amy moves a service to a different category in the admin, only that
// override is stored here. Everything else falls through to inferPublicCategory().
export const serviceOverrides = pgTable('service_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  square_variation_id: text('square_variation_id').unique().notNull(),
  category: text('category').notNull(), // 'lashes' | 'brows' | 'pmu' | 'addons'
  /** Position within the category on the public menu. null = use Square default order. */
  sort_order: integer('sort_order'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Site text blocks editable by admin (hero copy, category descriptions, etc.)
export const siteContent = pgTable('site_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  content_key: text('content_key').unique().notNull(),  // e.g. 'lashes_description'
  value: text('value').notNull(),
  label: text('label').notNull(),                        // human-readable label for admin UI
  // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case matches DB column names
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// ── Inferred types ────────────────────────────────────────────────────────────

export type SiteContent = typeof siteContent.$inferSelect
export type Customer = typeof customers.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type WaiverToken = typeof waiverTokens.$inferSelect
export type Waiver = typeof waivers.$inferSelect
export type AdminService = typeof adminServices.$inferSelect
export type GalleryImage = typeof galleryImages.$inferSelect
export type Announcement = typeof announcements.$inferSelect
export type SiteImage = typeof siteImages.$inferSelect
export type ManualWaiver = typeof manualWaivers.$inferSelect
export type ServiceOverride = typeof serviceOverrides.$inferSelect
