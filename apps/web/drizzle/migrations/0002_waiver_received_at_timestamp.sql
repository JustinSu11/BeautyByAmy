ALTER TABLE "bookings" DROP COLUMN "waiver_received";
ALTER TABLE "bookings" ADD COLUMN "waiver_received_at" timestamp;
