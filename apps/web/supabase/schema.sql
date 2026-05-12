-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Services ──────────────────────────────────────────────────────────────────
CREATE TABLE services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      TEXT NOT NULL CHECK (category IN ('lashes', 'brows', 'pmu', 'addons')),
  group_label   TEXT,
  name          TEXT NOT NULL,
  duration      TEXT NOT NULL,
  price         TEXT NOT NULL,
  enabled       BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Gallery images ────────────────────────────────────────────────────────────
CREATE TABLE gallery_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_id   TEXT NOT NULL UNIQUE,
  url             TEXT NOT NULL,
  blur_data_url   TEXT,
  category        TEXT NOT NULL,
  label           TEXT NOT NULL,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Announcements ─────────────────────────────────────────────────────────────
CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message    TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Site image slots ──────────────────────────────────────────────────────────
CREATE TABLE site_images (
  slot          TEXT PRIMARY KEY,
  cloudinary_id TEXT NOT NULL,
  url           TEXT NOT NULL,
  blur_data_url TEXT,
  alt           TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Waivers ───────────────────────────────────────────────────────────────────
CREATE TABLE waivers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name      TEXT NOT NULL,
  service          TEXT NOT NULL,
  appointment_date DATE,
  method           TEXT NOT NULL CHECK (method IN ('digital', 'manual')),
  signed_at        TIMESTAMPTZ,
  ip_address       TEXT,
  storage_path     TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER site_images_updated_at
  BEFORE UPDATE ON site_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
