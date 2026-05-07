// apps/web/src/db/schema.ts
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'

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
  waiverReceivedAt: timestamp('waiver_received_at'),
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
