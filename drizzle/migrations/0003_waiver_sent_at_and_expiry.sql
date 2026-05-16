ALTER TABLE "bookings" DROP COLUMN "waiver_sent";
ALTER TABLE "bookings" ADD COLUMN "waiver_sent_at" timestamp;
ALTER TABLE "waivers" ADD COLUMN "expires_at" timestamp NOT NULL DEFAULT (NOW() + INTERVAL '1 year');
ALTER TABLE "waivers" ALTER COLUMN "expires_at" DROP DEFAULT;
